import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { config } from '~/config'
import * as schema from '../schema/bun-sqlite'

const sqlite = new Database(config.db.sqlite)
export const db = drizzle({ client: sqlite, schema })
