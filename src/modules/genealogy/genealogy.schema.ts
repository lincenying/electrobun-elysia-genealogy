import { t } from 'elysia'

import { tt } from '~/plugins/elysia-schema-error'

/**
 * 族谱模块路由标签
 */
export const genealogyRouteTag = 'genealogy' as const

/**
 * 路径参数：族谱成员 id（SQLite 自增整数）
 */
export const genealogyIdParamsSchema = t.Object({
    id: tt.Integer('ID', { minimum: 1 }),
})
export type IGenealogyIdParams = typeof genealogyIdParamsSchema.static

/**
 * 新增族谱成员
 */
export const genealogyInsertSchema = t.Object({
    name: tt.String('姓名', { minLength: 1 }),
    parent: tt.Integer('父辈ID', { minimum: 0 }),
    sex: t.Optional(t.Union([t.String(), t.Null()])),
    desc: t.Optional(t.Union([t.String(), t.Null()])),
})
export type IGenealogyInsert = typeof genealogyInsertSchema.static

/**
 * 修改族谱成员（字段均可选，至少一项）
 */
export const genealogyModifySchema = t.Object({
    name: t.Optional(tt.String('姓名', { minLength: 1 })),
    parent: t.Optional(tt.Integer('父辈ID', { minimum: 0 })),
    sex: t.Optional(t.Union([t.String(), t.Null()])),
    desc: t.Optional(t.Union([t.String(), t.Null()])),
})
export type IGenealogyModify = typeof genealogyModifySchema.static
