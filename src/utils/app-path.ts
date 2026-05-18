import { existsSync } from 'node:fs'
import { join } from 'node:path'

const RESOURCES_APP_DIR = join(process.cwd(), '../Resources/app')
const RESOURCES_APP_CONFIG = join(RESOURCES_APP_DIR, 'config')

/**
 * 是否在 Electrobun 应用包内运行（cwd 为 Contents/MacOS）
 */
export function isElectrobunAppBundle(): boolean {
    return existsSync(RESOURCES_APP_CONFIG)
}

/**
 * 获取 Resources/app 目录（打包后静态资源、模板、配置根目录）
 */
export function getResourcesAppDir(): string {
    return RESOURCES_APP_DIR
}

/**
 * 解析应用资源路径：开发环境相对项目根目录，打包后相对 Resources/app
 */
export function resolveAppPath(...segments: string[]): string {
    if (isElectrobunAppBundle()) {
        return join(getResourcesAppDir(), ...segments)
    }
    return join(process.cwd(), ...segments)
}
