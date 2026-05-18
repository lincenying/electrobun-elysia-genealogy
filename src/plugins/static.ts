import { staticPlugin } from '@elysiajs/static'

import { config } from '~/config'
import { resolveAppPath } from '~/utils/app-path'

/**
 * 创建静态文件配置
 */
export function createStaticConfig() {
    return [
        staticPlugin({
            assets: resolveAppPath('public'),
            // 访问路径前缀
            prefix: config.static.prefix, // 默认: '/public'
            // 是否在找不到路由时返回 index.html（适用于 SPA）
            indexHTML: false, // 默认: false
            // 自定义响应头
            headers: {
                'Cache-Control': `public, max-age=${3600 * 24 * 30}`, // 30 days
            },
        }),
    ]
}
