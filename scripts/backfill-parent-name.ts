/**
 * 添加 parent_name 列并按 parent 字段回填父辈姓名
 *
 * 用法：
 *   bun run db:backfill-parent-name
 *   bun run db:backfill-parent-name -- --user-data
 *
 * 环境变量：
 *   SQLITE_DB_URL=./.data/db.sqlite3
 */

import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { Database } from 'bun:sqlite'

function resolveDbPath(): string {
    if (process.argv.includes('--user-data')) {
        const userDataPath = join(
            homedir(),
            'Library/Application Support/com.teb.tianyoucun.zupu/dev/data/db.sqlite3',
        )
        if (!existsSync(userDataPath)) {
            throw new Error(`未找到 userData 数据库: ${userDataPath}`)
        }
        return userDataPath
    }

    const dbPath = process.env.SQLITE_DB_URL || './.data/db.sqlite3'
    if (dbPath.startsWith('/')) {
        return dbPath
    }
    return join(process.cwd(), dbPath.replace(/^\.\//, ''))
}

function hasColumn(sqlite: Database, table: string, column: string): boolean {
    const columns = sqlite.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]
    return columns.some(item => item.name === column)
}

const dbPath = resolveDbPath()
console.log(`目标数据库: ${dbPath}`)

const sqlite = new Database(dbPath)

if (!hasColumn(sqlite, 'genealogy', 'parent_name')) {
    sqlite.exec('ALTER TABLE genealogy ADD parent_name text')
    console.log('已添加 parent_name 列')
}

const result = sqlite.prepare(`
  UPDATE genealogy
  SET parent_name = (
    SELECT name FROM genealogy AS p WHERE p.id = genealogy.parent
  )
  WHERE parent != 0
`).run()

const rows = sqlite.prepare(`
  SELECT id, name, parent, parent_name
  FROM genealogy
  ORDER BY id
  LIMIT 5
`).all() as { id: number, name: string, parent: number, parent_name: string | null }[]

for (const row of rows) {
    const display = row.parent === 0 ? '(始祖)' : (row.parent_name ?? '(空)')
    console.log(`ID ${row.id} ${row.name}: 父辈 -> ${display}`)
}

console.log(`\n完成：回填更新 ${result.changes} 条。`)
sqlite.close()
