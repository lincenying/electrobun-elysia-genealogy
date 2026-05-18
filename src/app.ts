import { serverTiming } from '@elysiajs/server-timing'
import { Elysia, file } from 'elysia'

import { genealogyApiRouter, genealogyRouter } from '~/modules/genealogy/genealogy.controller'
import { createStaticConfig } from '~/plugins'
import { accessLoggerMiddleware } from '~/plugins/access-logger'
import { resolveAppPath } from '~/utils/app-path'

/**
 * 组装 Elysia 应用：静态资源、日志、业务模块与兜底路由
 */
export function createApp() {
    return new Elysia({
        serve: {
            maxRequestBodySize: 1024 * 1024 * 256, // 256MB
        },
    })
        .use(serverTiming())
        .use(createStaticConfig())
        .use(accessLoggerMiddleware)
        .use(genealogyApiRouter)
        .use(genealogyRouter)
        .get('/favicon.ico', file(resolveAppPath('public', 'favicon.ico')))
        .get('/robots.txt', file(resolveAppPath('public', 'robots.txt')))
        .all('/sm/*', () => '')
        .all('/*', () => 'Page Not Found')
}

/** 单例应用（供监听与测试复用） */
export const app = createApp()

if (process.env.NODE_ENV === 'development') {
    // app.use(createSwaggerConfig())
}
