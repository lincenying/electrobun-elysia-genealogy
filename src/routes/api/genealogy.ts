import { Elysia } from 'elysia'

import { responseWrapperMiddleware } from '~/middleware/response-wrapper'
import { genealogyModel } from '~/models/sqlite/genealogy.model'
import { createCorsConfig } from '~/plugins'
import { validationSchema } from '~/schema/elysia-schema'

export const genealogyApiRouter = new Elysia({ prefix: '/api/genealogy' })
    .use(createCorsConfig())
    .use(validationSchema)
    .use(responseWrapperMiddleware)
    .get(
        '/lists/',
        () => genealogyModel.getList(), {
        },
    )
