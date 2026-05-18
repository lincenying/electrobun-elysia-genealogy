export type ApiResponse<T = unknown>
    = | { code: number, success: true, data: T, message?: string }
        | { code: number, success: false, message: string }

export interface ReqListQuery {
    all?: number
    by?: string
    from?: string
    id?: string
    limit?: number
    page?: number
    path?: string
    key?: string
    /* 列表中不显示的字段 */
    filter?: string
}

/**
 * 返回列表结构
 */
export interface ResData<T> {
    code: number
    data: T
    ok?: string | number
    from?: string
    message?: string
    msg?: string
    url?: string
}

export interface Lists<T> {
    hasNext?: number | boolean
    hasPrev?: number | boolean
    total: number
    list: T
}

/**
 * 返回列表结构
 */
export interface ResList<T> {
    code: number
    data: {
        list: T
    }
    message?: string
}

/**
 * 返回分页列表结构
 */
export interface ResLists<T> {
    code: number
    data: Lists<T>
    message?: string
}
