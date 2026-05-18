import { cors } from '@elysiajs/cors'

import { config } from '~/config'

/**
 * 创建 CORS 配置
 */
export function createCorsConfig() {
    return cors({
        origin: config.cors.origin,
        credentials: config.cors.credentials,
    })
}
