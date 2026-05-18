import { Elysia, t } from 'elysia'

import { tt } from './elysia-schema-error'

export const cookiesSchema = t.Partial(
    t.Cookie({
        user: t.String(),
        userid: t.String(),
        username: t.String(),
        b_user: t.String(),
        b_userid: t.String(),
        b_username: t.String(),
    }),
)
export type Cookies = typeof cookiesSchema.static

export const partialIdSchema = t.Partial(
    t.Object({
        id: tt.String('ID', {
            minLength: 24,
            maxLength: 24,
        }),
    }),
)
export type PartialId = typeof partialIdSchema.static

export const idSchema = t.Object({
    id: tt.String('ID', {
        minLength: 24,
        maxLength: 24,
    }),
})
export type Id = typeof idSchema.static

export const articleSearchSchema = t.Partial(
    t.Object({
        by: t.String(),
        id: t.String(),
        key: t.String(),
        filter: t.String(),
    }),
)
export type ArticleSearch = typeof articleSearchSchema.static

export const otherPageSchema = t.Partial(
    t.Object({
        page: t.Number(),
        limit: t.Number(),
    }),
)
export type OtherPage = typeof otherPageSchema.static

export const articlePageSchema = t.Partial(
    t.Object({
        page: t.String(),
        limit: t.String(),
        sort: t.String(),
        key: t.String(),
    }),
)
export type ArticlePage = typeof articlePageSchema.static

export const articleInsertSchema = t.Object({
    category: tt.String('分类'),
    content: tt.String('内容'),
    title: tt.String('标题'),
    html: tt.String('HTML'),
})
export type ArticleInsert = typeof articleInsertSchema.static

export const articleModifySchema = t.Object({
    id: tt.String('ID'),
    category_old: tt.String('旧分类'),
    category_name: tt.String('新分类'),
    category: tt.String('分类'),
    content: tt.String('内容'),
    title: tt.String('标题'),
    html: tt.String('HTML'),
})
export type ArticleModify = typeof articleModifySchema.static

export const categoryInsertSchema = t.Object({
    cate_name: tt.String('分类名称'),
    cate_order: tt.String('分类排序'),
})
export type CategoryInsert = typeof categoryInsertSchema.static

export const categoryModifySchema = t.Object({
    id: tt.String('ID'),
    cate_name: tt.String('分类名称'),
    cate_order: tt.String('分类排序'),
})
export type CategoryModify = typeof categoryModifySchema.static

export const commentInsertSchema = t.Object({
    id: tt.String('文章ID'),
    content: tt.String('评论内容'),
})
export type CommentInsert = typeof commentInsertSchema.static

export const userInsertSchema = t.Object({
    email: tt.String('邮箱', {
        format: 'email',
    }),
    password: tt.String('密码'),
    username: tt.String('用户名'),
})
export type UserInsert = typeof userInsertSchema.static

export const userLoginSchema = t.Object({
    password: tt.String('密码'),
    username: tt.String('用户名'),
})
export type UserLogin = typeof userLoginSchema.static

export const userAccountSchema = t.Object({
    email: tt.String('邮箱', {
        format: 'email',
    }),

})
export type UserAccount = typeof userAccountSchema.static

export const userPasswordSchema = t.Object({
    old_password: tt.String('旧密码'),
    password: tt.String('新密码'),
})
export type UserPassword = typeof userPasswordSchema.static

export const userModifySchema = t.Object({
    id: tt.String('ID'),
    email: tt.String('邮箱', {
        format: 'email',
    }),
    password: tt.String('密码'),
    username: tt.String('用户名'),
    update_date: t.Optional(tt.String('更新时间')),
})
export type UserModify = typeof userModifySchema.static
export type UserModifyForm = Optional<Omit<UserModify, 'id'>, 'password'>

export const validationSchema = new Elysia()
    .model({
        // 登录cookies
        'cookies': cookiesSchema,
        'partial-id': partialIdSchema,
        'id': idSchema,
        // 文章搜索条件
        'article.search': articleSearchSchema,
        'other.page': otherPageSchema,

        // 文章列表分页
        'article.page': articlePageSchema,
        // 发布文章
        'article.insert': articleInsertSchema,
        // 修改文章
        'article.modify': articleModifySchema,

        // 新增分类
        'category.insert': categoryInsertSchema,
        // 修改分类
        'category.modify': categoryModifySchema,

        // 发表评论
        'comment.insert': commentInsertSchema,

        // 注册用户
        'user.insert': userInsertSchema,
        // 登录用户
        'user.login': userLoginSchema,
        // 修改用户信息
        'user.account': userAccountSchema,
        // 修改密码
        'user.password': userPasswordSchema,
        // 修改用户信息
        'user.modify': userModifySchema,
    })
