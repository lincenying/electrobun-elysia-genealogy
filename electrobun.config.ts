import type { ElectrobunConfig } from 'electrobun'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createAliasPlugin } from './scripts/electrobun-alias-plugin'

const projectRoot = dirname(fileURLToPath(import.meta.url))

const config: ElectrobunConfig = {
    app: {
        name: '天井洋村族谱',
        identifier: 'com.teb.tianyoucun.zupu',
        version: '1.0.0',
        description: '天井洋村族谱',
    },
    build: {
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
