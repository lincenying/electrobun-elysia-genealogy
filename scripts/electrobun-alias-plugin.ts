import type { BunPlugin } from 'bun'
import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * 解析带 ~/、@/ 别名的模块路径（含 .ts 与目录 index）
 */
function resolveAliasedPath(srcDir: string, subpath: string): string | null {
    const base = join(srcDir, subpath)
    const candidates = [
        `${base}.ts`,
        `${base}.tsx`,
        `${base}.js`,
        join(base, 'index.ts'),
        join(base, 'index.tsx'),
    ]

    for (const candidate of candidates) {
        if (existsSync(candidate) && statSync(candidate).isFile()) {
            return candidate
        }
    }

    return null
}

/**
 * 为 Electrobun 打包解析 tsconfig paths（~/、@/）
 */
export function createAliasPlugin(projectRoot: string): BunPlugin {
    const srcDir = join(projectRoot, 'src')

    return {
        name: 'electrobun-path-alias',
        setup(build) {
            build.onResolve({ filter: /^~\/|^@\// }, (args) => {
                const subpath = args.path.replace(/^~\/|^@\//, '')
                const resolved = resolveAliasedPath(srcDir, subpath)

                if (!resolved) {
                    return undefined
                }

                return { path: resolved }
            })
        },
    }
}
