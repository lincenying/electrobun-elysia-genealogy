import { asc } from 'drizzle-orm'
import Twig from 'twig'

import { db } from '~/db'
import { genealogy } from '~/db/schema'
import { ApiError } from '~/plugins/response-wrapper'
import { getErrorMessage, getTemplateDir } from '~/utils'

/**
 * 族谱业务：数据查询与页面模板渲染
 */
export class GenealogyService {
    /**
     * 族谱列表（按 id 升序）
     */
    public static async getList() {
        try {
            return await db.select().from(genealogy).orderBy(asc(genealogy.id))
        }
        catch (err: unknown) {
            throw new ApiError(-200, getErrorMessage(err))
        }
    }

    /**
     * 渲染族谱 Twig 页面
     */
    public static async renderGenealogyPage(): Promise<string> {
        const templateDir = getTemplateDir('./views/genealogy.twig')
        return await new Promise<string>((resolve) => {
            Twig.renderFile(templateDir, { title: '族谱' }, (err, html) => {
                resolve(err ? err.toString() : html)
            })
        })
    }
}
