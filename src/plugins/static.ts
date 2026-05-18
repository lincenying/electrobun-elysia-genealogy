import { staticPlugin } from '@elysiajs/static'

import { config } from '~/config'

/**
 * 创建静态文件配置
 */
export function createStaticConfig() {
    return [
        staticPlugin({
            // 静态文件目录（相对于项目根目录）
            assets: config.static.assetsPath, // 默认: 'public'
            // 访问路径前缀
            prefix: config.static.prefix, // 默认: '/public'
            // 是否在找不到路由时返回 index.html（适用于 SPA）
            indexHTML: false, // 默认: false
            // 自定义响应头
            headers: {
                'Cache-Control': `public, max-age=${3600 * 24 * 30}`, // 30 days
            },
        }),
        staticPlugin({
            // 静态文件目录（相对于项目根目录）
            assets: 'uploads', // 默认: 'public'
            // 访问路径前缀
            prefix: '/uploads', // 默认: '/public'
            // 是否在找不到路由时返回 index.html（适用于 SPA）
            indexHTML: false, // 默认: false
            // 自定义响应头
            headers: {
                'Cache-Control': `public, max-age=${3600 * 24 * 30}`, // 30 days
            },
        }),
    ]
}
