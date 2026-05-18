import type { ElectrobunConfig } from 'electrobun'

const config: ElectrobunConfig = {
    app: {
        name: '天井洋村族谱',
        identifier: 'com.teb.tianyoucun.zupu',
        version: '0.1.0',
        description: '天井洋村族谱',
    },
    build: {
        bun: {
            entrypoint: 'src/index.ts',
        },
    },
}

export default config
