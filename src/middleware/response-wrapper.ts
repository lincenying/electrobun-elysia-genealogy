import type { ApiResponse } from '~/types/global.types'

import { Elysia } from 'elysia'

/**
 * API 错误类
 *
 * 继承自Error，包含错误码信息
 * 中间件会自动检测此类型的错误并根据错误码设置相应的HTTP状态码
 */
export class ApiError extends Error {
    public readonly code: number

    constructor(code: number, message: string) {
        super(message)
        this.code = code
        this.name = 'ApiError'
    }
}

/**
 * 响应包装中间件
 *
 * 自动将 Service 层的返回值包装为标准 API 响应格式
 * - 正常数据自动包装为 { success: true, data: T }
 * - 抛出的错误自动捕获并转换为 { success: false, error: string }
 */
export const responseWrapperMiddleware = new Elysia({
    name: 'response-wrapper',
})
    .onAfterHandle(({ responseValue }) => {
        let message = ''
        if (typeof responseValue === 'string')
            message = responseValue
        // 正常数据包装为成功响应
        const successResponse: ApiResponse<typeof responseValue> = {
            code: 200,
            success: true,
            data: responseValue,
            message,
        }

        return successResponse
    })
    .onError(({ error, set, code }) => {
        // 捕获未处理的异常并转换为错误响应
        let errorMessage: any = '服务器内部错误'
        let statusCode = 500

        if (error instanceof ApiError) {
            // 处理业务错误，直接使用错误码作为HTTP状态码
            errorMessage = error.message
            statusCode = error.code
        }
        else if (code === 'VALIDATION') {
            console.log(error)
            errorMessage = error.customError ? error.customError : `${error.messageValue?.path.replace('/', '')}: ${error.messageValue?.message}`
        }
        else if (error instanceof Error) {
            // 其他错误默认使用 500 状态码
            errorMessage = error.message
        }
        else {
            errorMessage = String(error)
        }

        set.status = 200

        const errorResponse: ApiResponse<never> = {
            code: statusCode,
            success: false,
            message: errorMessage,
        }

        return errorResponse
    })
    .as('scoped')
