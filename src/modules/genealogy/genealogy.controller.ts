import { html } from '@elysiajs/html'
import { Elysia } from 'elysia'

import { createCorsConfig } from '~/plugins'
import { responseWrapperMiddleware } from '~/plugins/response-wrapper'
import { validationSchema } from '~/plugins/validation-schema'
import { GenealogyService } from './genealogy.service'

/**
 * 族谱页面路由（Twig HTML）
 */
export const genealogyRouter = new Elysia()
    .use(validationSchema)
    .use(html())
    .get('/', async () => {
        return await GenealogyService.renderGenealogyPage()
    })

/**
 * 族谱 API 路由
 */
export const genealogyApiRouter = new Elysia({ prefix: '/api/genealogy' })
    .use(createCorsConfig())
    .use(validationSchema)
    .use(responseWrapperMiddleware)
    .get('/lists/', () => GenealogyService.getList())
    .post('/', ({ body }) => GenealogyService.create(body), {
        body: 'genealogy.insert',
    })
    .put('/:id', ({ params, body }) => GenealogyService.update(Number(params.id), body), {
        params: 'genealogy.id',
        body: 'genealogy.modify',
    })
    .delete('/:id', ({ params }) => GenealogyService.delete(Number(params.id)), {
        params: 'genealogy.id',
    })
