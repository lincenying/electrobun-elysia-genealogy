import type z from 'zod'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'

export const genealogy = sqliteTable('genealogy', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    parent: integer('parent').notNull(),
    sex: text('sex'),
    desc: text('desc'),
})

export const insertGenealogySchema = createInsertSchema(genealogy).omit({
    id: true,
})

export const modifyGenealogySchema = createUpdateSchema(genealogy)

export const selectGenealogySchema = createSelectSchema(genealogy)

export type Genealogy = typeof genealogy.$inferSelect
export type NewGenealogy = z.infer<typeof insertGenealogySchema>
export type ModifiedGenealogy = z.infer<typeof modifyGenealogySchema>
