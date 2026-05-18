import pino from 'pino'

import { config } from '~/config'

/**
 * 生产级日志实例
 * 使用 pino - 一个快速、低开销的 Node.js 日志库
 *
 * 特性：
 * - 高性能（比 winston 快 5-10 倍）
 * - 结构化日志（JSON 格式）
 * - 低内存占用
 * - 丰富的生态系统
 */
export const logger = pino({
    level: config.log.level,
    transport: config.server.nodeEnv === 'development' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
        },
    } : undefined,
})
