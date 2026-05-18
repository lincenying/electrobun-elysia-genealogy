import { mkdir } from 'node:fs/promises'
import { serverTiming } from '@elysiajs/server-timing'
import { BrowserWindow } from 'electrobun'

import { Elysia, file } from 'elysia'
import { config } from '~/config'
import { isElectrobunAppBundle, resolveAppPath } from '~/utils/app-path'
import { logger } from '~/utils/logger'
import { accessLoggerMiddleware } from './middleware/access-logger'
import { createStaticConfig } from './plugins'
import { genealogyApiRouter } from './routes/api/genealogy'
// import { createSwaggerConfig } from './plugins/swagger'
import { genealogyRouter } from './routes/genealogy'

(async () => {
    const UPLOAD_DIR = resolveAppPath('uploads')
    await mkdir(UPLOAD_DIR, { recursive: true })

    // 这个没什么用, 只是让开发环境时, 修改twig模板会重启进程
    if (process.env.NODE_ENV === 'development' && !isElectrobunAppBundle()) {
        const viewsDir = resolveAppPath('views')
        const glob = new Bun.Glob('**/*.twig')
        const files = Array.from(glob.scanSync({ cwd: viewsDir }))
        console.log('模板文件监听:', files)
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
    .get('/favicon.ico', file(resolveAppPath('public', 'favicon.ico')))
    .get('/robots.txt', file(resolveAppPath('public', 'robots.txt')))
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

// @ts-ignore 1234
// eslint-disable-next-line ts/no-unused-vars
const mainWindow = new BrowserWindow({
    title: '天井洋村族谱',
    frame: { x: 20, y: 20, width: 1660, height: 1024 },
    url: `http://${app.server?.hostname}:${app.server?.port}/`,
})

// mainWindow.webview.on('dom-ready', () => {
//     mainWindow.setFullScreen(true) // 页面渲染完成后全屏
// })
