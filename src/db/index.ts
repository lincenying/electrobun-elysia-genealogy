import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { isAbsolute, join } from 'node:path'
import { Database } from 'bun:sqlite'
import { count } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { Utils } from 'electrobun'
import { config } from '~/config'
import { isElectrobunAppBundle, resolveAppPath } from '~/utils/app-path'
import * as schema from './schema'

/**
 * 读取 genealogy 表行数；表不存在时返回 0（使用 Drizzle，避免手写 SQL）
 */
function getGenealogyRowCount(dbPath: string): number {
    if (!existsSync(dbPath)) {
        return 0
    }

    const sqlite = new Database(dbPath, { readonly: true })
    try {
        const readonlyDb = drizzle({ client: sqlite, schema })
        const row = readonlyDb.select({ n: count() }).from(schema.genealogy).get()
        return row?.n ?? 0
    }
    catch {
        return 0
    }
    finally {
        sqlite.close()
    }
}

/**
 * 将应用包内置数据库复制到 userData（首次启动或 userData 库为空时）
 */
function seedUserDatabaseFromBundle(userDbPath: string, bundledDbPath: string): void {
    if (!existsSync(bundledDbPath)) {
        return
    }

    const bundledRows = getGenealogyRowCount(bundledDbPath)
    if (bundledRows === 0) {
        return
    }

    const userRows = getGenealogyRowCount(userDbPath)
    if (!existsSync(userDbPath) || userRows === 0) {
        copyFileSync(bundledDbPath, userDbPath)
    }
}

/**
 * 解析 SQLite 路径：开发环境用项目 .data；Electrobun 打包后从内置库种子到 userData
 */
function resolveSqlitePath(dbPath: string): string {
    if (isAbsolute(dbPath)) {
        return dbPath
    }

    if (isElectrobunAppBundle()) {
        const dataDir = join(Utils.paths.userData, 'data')
        mkdirSync(dataDir, { recursive: true })
        const userDbPath = join(dataDir, 'db.sqlite3')
        const bundledDbPath = resolveAppPath('data', 'db.sqlite3')
        seedUserDatabaseFromBundle(userDbPath, bundledDbPath)
        return userDbPath
    }

    const normalized = dbPath.replace(/^\.\//, '')
    const absolute = join(process.cwd(), normalized)
    mkdirSync(join(absolute, '..'), { recursive: true })
    return absolute
}

const sqlite = new Database(resolveSqlitePath(config.db.sqlite))
export const db = drizzle({ client: sqlite, schema })

/**
 * 执行 Drizzle 迁移，确保 SQLite 表结构已创建
 */
function runMigrations(): void {
    migrate(db, { migrationsFolder: resolveAppPath('drizzle-sqlite') })
}

runMigrations()
