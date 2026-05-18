import { asc } from 'drizzle-orm'
import { db } from '~/db/bun-sqlite'
import { ApiError } from '~/middleware/response-wrapper'
import { genealogy } from '~/schema/bun-sqlite'
import { getErrorMessage } from '~/utils'

export class genealogyModel {
    /**
     * 用户列表
     */
    public static async getList() {
        try {
            const data = await db.select().from(genealogy).orderBy(asc(genealogy.id))
            return data
        }
        catch (err: unknown) {
            throw new ApiError(-200, getErrorMessage(err))
        }
    }
}
