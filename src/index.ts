import { mkdir } from 'node:fs/promises'
import { BrowserWindow } from 'electrobun'

import { app } from '~/app'
import { config } from '~/config'
import { isElectrobunAppBundle, resolveAppPath } from '~/utils/app-path'
import { logger } from '~/utils/logger'

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
