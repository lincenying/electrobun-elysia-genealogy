import { BrowserWindow } from 'electrobun'

import { app } from '~/app'
import { config } from '~/config'
import { isElectrobunAppBundle, resolveAppPath } from '~/utils/app-path'
import { logger } from '~/utils/logger'

(async () => {
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

const mainWindow = new BrowserWindow({
    title: '天井洋村族谱',
    frame: { x: 10, y: 10, width: 1660, height: 1024 },
    url: `http://${app.server?.hostname}:${app.server?.port}/`,
})

/**
 * 刷新 WebView 布局视口
 * Electrobun 首次加载时 innerHeight/clientHeight 可能等于外层 frame（含标题栏），
 * 实际可视区更小；触发一次 resize 与手动改窗口尺寸效果相同
 */
function refreshWebviewLayout() {
    const { width, height } = mainWindow.getSize()
    mainWindow.setSize(width, height - 1)
    setTimeout(() => mainWindow.setSize(width, height), 0)
}

mainWindow.webview.on('dom-ready', () => {
    refreshWebviewLayout()
})
