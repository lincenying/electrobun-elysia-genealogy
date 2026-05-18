/* eslint-disable node/prefer-global/process */
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    dialect: 'sqlite',
    schema: './src/schema/bun-sqlite.ts',
    out: './drizzle-sqlite',
    dbCredentials: {
        url: process.env.SQLITE_DB_URL!,
    },
    verbose: true,
    strict: true,
})
