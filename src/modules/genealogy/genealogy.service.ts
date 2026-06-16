import type { IGenealogyInsert, IGenealogyModify } from './genealogy.schema'
import { asc, count, eq } from 'drizzle-orm'

import Twig from 'twig'
import { db } from '~/db'
import { genealogy } from '~/db/schema'
import { ApiError } from '~/plugins/response-wrapper'
import { getErrorMessage, getTemplateDir } from '~/utils'

/**
 * 族谱业务：数据查询、增删改与页面模板渲染
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
     * 按 id 查询单条记录
     */
    public static async getById(id: number) {
        try {
            const row = await db.select().from(genealogy).where(eq(genealogy.id, id)).get()
            if (!row) {
                throw new ApiError(404, '族谱成员不存在')
            }
            return row
        }
        catch (err: unknown) {
            if (err instanceof ApiError) {
                throw err
            }
            throw new ApiError(-200, getErrorMessage(err))
        }
    }

    /**
     * 新增族谱成员
     */
    public static async create(data: IGenealogyInsert) {
        try {
            await GenealogyService.validateParent(undefined, data.parent)
            const parentName = await GenealogyService.resolveParentName(data.parent)
            const [row] = await db.insert(genealogy).values({
                name: data.name,
                parent: data.parent,
                parent_name: parentName,
                sex: data.sex ?? null,
                desc: data.desc ?? null,
            }).returning()
            return row
        }
        catch (err: unknown) {
            if (err instanceof ApiError) {
                throw err
            }
            throw new ApiError(-200, getErrorMessage(err))
        }
    }

    /**
     * 更新族谱成员
     */
    public static async update(id: number, data: IGenealogyModify) {
        try {
            const existing = await GenealogyService.getById(id)
            const keys = Object.keys(data) as (keyof IGenealogyModify)[]
            if (keys.length === 0) {
                throw new ApiError(400, '请至少提供一个要修改的字段')
            }

            const nextParent = data.parent !== undefined ? data.parent : existing.parent
            if (data.parent !== undefined) {
                await GenealogyService.validateParent(id, nextParent)
            }

            const nextParentName = data.parent !== undefined ? await GenealogyService.resolveParentName(nextParent) : undefined

            const [row] = await db.update(genealogy).set({
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.parent !== undefined ? { parent: data.parent } : {}),
                ...(nextParentName !== undefined ? { parent_name: nextParentName } : {}),
                ...(data.sex !== undefined ? { sex: data.sex } : {}),
                ...(data.desc !== undefined ? { desc: data.desc } : {}),
            }).where(eq(genealogy.id, id)).returning()

            if (data.name !== undefined && data.name !== existing.name) {
                await db.update(genealogy)
                    .set({ parent_name: data.name })
                    .where(eq(genealogy.parent, id))
            }

            return row
        }
        catch (err: unknown) {
            if (err instanceof ApiError) {
                throw err
            }
            throw new ApiError(-200, getErrorMessage(err))
        }
    }

    /**
     * 删除族谱成员（存在子辈时禁止删除）
     */
    public static async delete(id: number) {
        try {
            await GenealogyService.getById(id)

            const childCount = await db
                .select({ n: count() })
                .from(genealogy)
                .where(eq(genealogy.parent, id))
                .get()

            if ((childCount?.n ?? 0) > 0) {
                throw new ApiError(400, '该成员存在子辈，无法删除，请先处理子辈节点')
            }

            const [row] = await db.delete(genealogy).where(eq(genealogy.id, id)).returning()
            return row
        }
        catch (err: unknown) {
            if (err instanceof ApiError) {
                throw err
            }
            throw new ApiError(-200, getErrorMessage(err))
        }
    }

    /**
     * 根据父辈 id 解析父辈姓名
     */
    private static async resolveParentName(parentId: number): Promise<string | null> {
        if (parentId === 0) {
            return null
        }

        const parentRow = await db
            .select({ name: genealogy.name })
            .from(genealogy)
            .where(eq(genealogy.id, parentId))
            .get()

        return parentRow?.name ?? null
    }

    /**
     * 校验父辈 id：存在性、非自身、无环
     */
    private static async validateParent(nodeId: number | undefined, parentId: number) {
        if (parentId === 0) {
            return
        }

        if (nodeId !== undefined && parentId === nodeId) {
            throw new ApiError(400, '父辈不能是自身')
        }

        const parentRow = await db.select().from(genealogy).where(eq(genealogy.id, parentId)).get()
        if (!parentRow) {
            throw new ApiError(400, '指定的父辈成员不存在')
        }

        if (nodeId === undefined) {
            return
        }

        let currentId: number | null = parentId
        const visited = new Set<number>()

        while (currentId !== null && currentId !== 0) {
            if (currentId === nodeId) {
                throw new ApiError(400, '父辈设置会形成循环关系')
            }
            if (visited.has(currentId)) {
                break
            }
            visited.add(currentId)

            const ancestor = await db
                .select({ parent: genealogy.parent })
                .from(genealogy)
                .where(eq(genealogy.id, currentId))
                .get()

            currentId = ancestor?.parent ?? null
            if (currentId === 0) {
                currentId = null
            }
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
