/* eslint-disable node/prefer-global/process */
import { mkdir } from 'node:fs/promises'
import { serverTiming } from '@elysiajs/server-timing'
import { BrowserWindow } from 'electrobun'

import { Elysia, file } from 'elysia'
import { config } from '~/config'
import { logger } from '~/utils/logger'
import { accessLoggerMiddleware } from './middleware/access-logger'
import { createStaticConfig } from './plugins'
import { genealogyApiRouter } from './routes/api/genealogy'
// import { createSwaggerConfig } from './plugins/swagger'
import { genealogyRouter } from './routes/genealogy'

(async () => {
    const UPLOAD_DIR = './uploads'
    await mkdir(UPLOAD_DIR, { recursive: true })

    // 这个没什么用, 只是让开发环境时, 修改twig模板会重启进程
    if (process.env.NODE_ENV === 'development') {
        const glob = new Bun.Glob('**/*.twig') // 匹配所有 .twig 文件（包含子目录）
        const files = Array.from(glob.scanSync({ cwd: './views' }))
        console.log(`模板文件监听: `, files)
        await Promise.all(files.map(file => import(`../views/${file}`)))
    }
})()

const app = new Elysia({
    serve: {
        maxRequestBodySize: 1024 * 1024 * 256, // 256MB
    },
})
    .use(serverTiming())
    .use(createStaticConfig())
    .use(accessLoggerMiddleware)
    .use(genealogyApiRouter)
    .use(genealogyRouter)
    .get('/favicon.ico', file('./public/favicon.ico'))
    .get('/robots.txt', file('./public/robots.txt'))
    .all('/sm/*', () => '')
    .all('/*', () => 'Page Not Found')
    // .all('/*', file('./dist/index.html'))

if (process.env.NODE_ENV === 'development') {
    // app.use(createSwaggerConfig())
}

app.listen(config.server.port)

// 获取正确的访问信息
logger.info(`🚀 服务器运行在 http://${app.server?.hostname}:${app.server?.port}`)
logger.info(`📋 API文档地址: http://${app.server?.hostname}:${app.server?.port}${config.swagger.path}`)

// eslint-disable-next-line no-new
new BrowserWindow({
    title: 'Elysia + SQLite 示例',
    frame: { x: 120, y: 120, width: 560, height: 720 },
    url: `http://${app.server?.hostname}:${app.server?.port}/`,
})
