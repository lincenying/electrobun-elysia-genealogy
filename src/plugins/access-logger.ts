import { Elysia } from 'elysia'

import { logger } from '~/utils/logger'

/**
 * Access 日志中间件
 * 记录所有 HTTP 请求的访问日志
 *
 * 功能：
 * - 记录请求开始时间和基本信息
 * - 记录响应时间和状态码
 * - 包含用户代理、IP 地址等关键信息
 * - 使用结构化日志格式便于分析
 */
export const accessLoggerMiddleware = new Elysia({ name: 'access-logger' })
    .derive(({ request }) => {
        const startTime = Date.now()
        const requestId = crypto.randomUUID()

        // 获取客户端标识信息 - 使用 User-Agent
        const userAgent = request.headers.get('user-agent') ?? '未知'

        // 创建客户端标识字符串，截断过长的 User-Agent
        const clientInfo
            = userAgent !== '未知' ? `${userAgent.substring(0, 80)}${userAgent.length > 80 ? '...' : ''}` : '未知客户端'

        return {
            startTime,
            requestId,
            userAgent,
            clientInfo,
        }
    })
    .onBeforeHandle(
        ({ request, startTime, requestId, clientInfo, userAgent }) => {
            // 记录请求开始
            const contentType = request.headers.get('content-type') ?? '未知'
            if (!request.url.includes('/sm/')) {
                logger.info(
                    {
                        requestId,
                        method: request.method,
                        url: request.url,
                        userAgent,
                        contentType,
                        startTime: new Date(startTime).toISOString(),
                    },

                    `🕊️ ${request.method} ${new URL(request.url).pathname} - 客户端访问 [${clientInfo}]`,
                )
            }
        },
    )
    .onAfterHandle(({ request, set, startTime, requestId, clientInfo }) => {
        const endTime = Date.now()
        const duration = endTime - (startTime ?? endTime)
        const status = typeof set.status === 'number' ? set.status : 200

        // 根据状态码选择不同的图标和颜色指示
        const statusIcon = status >= 400 ? '❌' : status >= 300 ? '🔄' : '✅'
        const statusText
            = status >= 400 ? '错误' : status >= 300 ? '重定向' : '成功'

        // 记录请求完成
        if (!request.url.includes('/sm/')) {
            logger.info(
                {
                    requestId,
                    method: request.method,
                    url: request.url,
                    status,
                    duration,
                    // contentLength: set.headers?.['content-length'] ?? '未知',
                    endTime: new Date(endTime).toISOString(),
                },
                `${statusIcon} ${request.method} ${new URL(request.url).pathname} - ${statusText} ${status} (${duration}ms) [${clientInfo}]`,
            )
        }
    })
    .onError(({ request, error, startTime, requestId, clientInfo }) => {
        const endTime = Date.now()
        const duration = endTime - (startTime ?? endTime)

        // 安全地提取错误信息
        const errorMessage = error instanceof Error ? error.message : String(error)
        const errorStack = error instanceof Error ? error.stack : undefined

        // 记录请求错误
        logger.error(
            {
                requestId,
                method: request.method,
                url: request.url,
                error: errorMessage,
                duration,
                stack: errorStack,
                endTime: new Date(endTime).toISOString(),
            },
            `💥 ${request.method} ${new URL(request.url).pathname} - 失败 (${duration}ms) [${clientInfo}] - ${errorMessage}`,
        )
    })
    .as('scoped')
