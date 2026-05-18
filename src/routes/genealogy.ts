import { html } from '@elysiajs/html'
import { Elysia } from 'elysia'

import { AdminTemplateController } from '~/controllers/genealogy.controller'
import { validationSchema } from '~/schema/elysia-schema'

export const genealogyRouter = new Elysia()
    .use(validationSchema)
    .use(html())
    .get('/', async () => {
        return await AdminTemplateController.genealogyTemplate()
    })
