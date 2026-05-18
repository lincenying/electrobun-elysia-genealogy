import type { ElectrobunConfig } from 'electrobun'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createAliasPlugin } from './scripts/electrobun-alias-plugin'

const projectRoot = dirname(fileURLToPath(import.meta.url))

/** macOS 应用显示名（写入 CFBundleDisplayName，不影响构建路径） */
const APP_DISPLAY_NAME = '天井洋村族谱'

const config: ElectrobunConfig = {
    app: {
        // 构建产物路径须为 ASCII（Bun.Archive 不支持中文路径，stable 会失败）
        name: 'TianJingYangCunZuPu',
        identifier: 'com.teb.tianyoucun.zupu',
        version: '1.0.0',
        description: APP_DISPLAY_NAME,
    },
    scripts: {
        // dev：签名可直接运行的 .app；stable：在 postWrap 签名自解压包（写入 DMG）
        postBuild: 'scripts/electrobun-macos-bundle.ts',
        postWrap: 'scripts/electrobun-macos-bundle.ts',
    },
    release: {
        // 本地 stable 构建无发布地址时跳过增量 patch
        generatePatch: false,
    },
    build: {
        targets: 'all',
        mac: {
            // 有 Apple 开发者证书时设为 true，并 export ELECTROBUN_DEVELOPER_ID="Developer ID Application: ..."
            codesign: false,
        },
        bun: {
            entrypoint: 'src/index.ts',
            plugins: [createAliasPlugin(projectRoot)],
        },
        copy: {
            'config': 'config',
            'public': 'public',
            'views': 'views',
            'drizzle-sqlite': 'drizzle-sqlite',
            '.data': 'data',
        },

        win: {
            icon: 'icon.iconset/icon_256x256.png',
        },

        watch: [
            'views/**/*.twig',
            'public/**/*',
            'config/**/*',
            'drizzle-sqlite/**/*',
            '.data/**/*',
            'src/**/*.ts',
        ],
    },
}

export default config
