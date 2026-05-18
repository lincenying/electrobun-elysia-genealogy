import { swagger } from '@elysiajs/swagger'

import { config } from '~/config'

/**
 * 获取服务访问 URL
 */
export function getServiceUrl(): { internal: string, external: string } {
    const displayHost
        = config.server.host === '0.0.0.0' ? 'localhost' : config.server.host

    const internal = `http://${displayHost}:${config.server.port}`

    let external: string
    if (config.server.externalPort && config.server.externalHost) {
        external = `http://${config.server.externalHost}:${config.server.externalPort}`
    }
    else {
        const externalPort = config.server.externalPort ?? config.server.port
        external = `http://${displayHost}:${externalPort}`
    }

    return { internal, external }
}

/**
 * 创建 Swagger 配置
 */
export function createSwaggerConfig() {
    const { internal, external } = getServiceUrl()

    return swagger({
        scalarCDN: 'https://cdnjs.cloudflare.com/ajax/libs/scalar-api-reference/1.25.103/standalone.min.js',
        documentation: {
            info: {
                title: config.swagger.title,
                version: config.swagger.version,
                description: config.swagger.description,
            },
            servers: internal !== external ? [
                {
                    url: external,
                    description: '服务器 URL',
                },
                {
                    url: internal,
                    description: '服务器内部 URL',
                },
            ] : [
                {
                    url: external,
                    description: '服务器 URL',
                },
            ],
        },
        path: config.swagger.path,
    })
}
