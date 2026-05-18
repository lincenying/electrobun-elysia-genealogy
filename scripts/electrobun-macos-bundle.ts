/**
 * Electrobun macOS 构建后处理：中文显示名 + 本地 ad-hoc 签名
 * - postBuild：dev 直接运行的 .app
 * - postWrap：stable/canary 自解压安装包（DMG 内分发）
 *
 * 有 Apple 开发者证书时可设置 ELECTROBUN_DEVELOPER_ID 并开启 build.mac.codesign，
 * 本脚本在检测到该变量时会跳过 ad-hoc 签名。
 */
import { execSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DISPLAY_NAME = '天井洋村族谱'

const ENTITLEMENTS_PLIST = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
</dict>
</plist>
`

/** 在目录树中查找 .app 包路径 */
function findAppBundle(dir: string): string | null {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const fullPath = join(dir, entry.name)
        if (entry.isDirectory() && entry.name.endsWith('.app')) {
            return fullPath
        }
        if (entry.isDirectory()) {
            const nested = findAppBundle(fullPath)
            if (nested)
                return nested
        }
    }
    return null
}

/** 写入 CFBundleDisplayName */
function patchDisplayName(appBundle: string): void {
    const plistPath = join(appBundle, 'Contents', 'Info.plist')
    if (!existsSync(plistPath)) {
        console.warn(`[macos-bundle] 未找到 Info.plist: ${plistPath}`)
        return
    }

    let plist = readFileSync(plistPath, 'utf8')
    if (plist.includes('<key>CFBundleDisplayName</key>')) {
        plist = plist.replace(
            /<key>CFBundleDisplayName<\/key>\s*<string>[^<]*<\/string>/,
            `<key>CFBundleDisplayName</key>\n    <string>${DISPLAY_NAME}</string>`,
        )
    }
    else {
        plist = plist.replace(
            /(<key>CFBundleName<\/key>\s*<string>[^<]*<\/string>)/,
            `$1\n    <key>CFBundleDisplayName</key>\n    <string>${DISPLAY_NAME}</string>`,
        )
    }

    writeFileSync(plistPath, plist)
    console.log(`[macos-bundle] CFBundleDisplayName=${DISPLAY_NAME}`)
}

/** 需要 JIT 等权限的辅助二进制（不含 launcher） */
const ADHOC_SIGN_BINARIES = [
    'bspatch',
    'zig-zstd',
    'libasar.dylib',
    'libElectrobunCore.dylib',
    'libNativeWrapper.dylib',
    'bun',
] as const

/** 检测 Mach-O 是否带有代码签名 */
function isBinarySigned(binPath: string): boolean {
    try {
        execSync(`codesign -dv "${binPath}" 2>&1`, { stdio: 'pipe' })
        return true
    }
    catch {
        return false
    }
}

/**
 * 确保 Zig launcher 未被签名。
 * 对 launcher 或整包 .app 做 codesign 会在 process.EnvMap.copy 时段错误 (SIGSEGV)。
 */
function ensureLauncherUnsigned(appBundle: string): void {
    const launcherPath = join(appBundle, 'Contents', 'MacOS', 'launcher')
    if (!existsSync(launcherPath))
        return

    if (!isBinarySigned(launcherPath)) {
        console.log('[macos-bundle] launcher 未签名（正常）')
        return
    }

    console.warn(
        '[macos-bundle] 检测到 launcher 已被签名，将移除签名以避免启动崩溃 (EnvMap.copy SIGSEGV)',
    )
    execSync(`codesign --remove-signature "${launcherPath}"`, { stdio: 'inherit' })
}

/**
 * 本地 ad-hoc 签名辅助二进制并清除隔离属性。
 *
 * 注意：切勿对 Contents/MacOS/launcher 或整个 .app 使用 codesign --deep。
 * 主程序 launcher 必须保持未签名；首次打开若被拦截，可右键「打开」或依赖 xattr -cr。
 */
function adhocSignAppBundle(appBundle: string): void {
    const macosDir = join(appBundle, 'Contents', 'MacOS')
    if (!existsSync(macosDir)) {
        console.warn(`[macos-bundle] 未找到 MacOS 目录，跳过签名`)
        return
    }

    const entitlementsPath = join('/tmp', `electrobun-${process.pid}-entitlements.plist`)
    writeFileSync(entitlementsPath, ENTITLEMENTS_PLIST)

    for (const name of ADHOC_SIGN_BINARIES) {
        const binPath = join(macosDir, name)
        if (!existsSync(binPath))
            continue

        execSync(
            `codesign --force --sign - --entitlements "${entitlementsPath}" "${binPath}"`,
            { stdio: 'inherit' },
        )
    }

    try {
        execSync(`xattr -cr "${appBundle}"`, { stdio: 'pipe' })
    }
    catch {
        // 忽略 xattr 失败
    }

    ensureLauncherUnsigned(appBundle)

    if (isBinarySigned(appBundle)) {
        console.warn(
            '[macos-bundle] 警告：.app 根目录带有签名，可能导致 launcher 异常；请勿对整包 codesign --deep',
        )
    }

    console.log(
        `[macos-bundle] 已签名辅助二进制（launcher 保持未签名）: ${appBundle}`,
    )
}

const wrapperPath = process.env.ELECTROBUN_WRAPPER_BUNDLE_PATH
const buildDir = process.env.ELECTROBUN_BUILD_DIR
const appBundle
    = wrapperPath && existsSync(wrapperPath) ? wrapperPath : buildDir ? findAppBundle(buildDir) : null

if (!appBundle) {
    console.warn('[macos-bundle] 未找到 .app，跳过')
    process.exit(0)
}

const buildEnv = process.env.ELECTROBUN_BUILD_ENV ?? 'dev'
const isPostWrap = Boolean(process.env.ELECTROBUN_WRAPPER_BUNDLE_PATH)

// stable/canary 的 postBuild 阶段 MacOS 二进制尚未复制完成，仅写入显示名
if (buildEnv !== 'dev' && !isPostWrap) {
    patchDisplayName(appBundle)
    console.log('[macos-bundle] 非 dev 构建的 postBuild 阶段，跳过签名（将在 postWrap 执行）')
    process.exit(0)
}

if (process.env.ELECTROBUN_DEVELOPER_ID) {
    console.log('[macos-bundle] 已配置 ELECTROBUN_DEVELOPER_ID，跳过 ad-hoc 签名')
    patchDisplayName(appBundle)
    process.exit(0)
}

patchDisplayName(appBundle)
ensureLauncherUnsigned(appBundle)
adhocSignAppBundle(appBundle)
