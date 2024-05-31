import { relations, sql } from "drizzle-orm"
import { text, integer, sqliteTable, foreignKey, type AnySQLiteColumn } from "drizzle-orm/sqlite-core"

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  passwordSalt: text('password_salt').notNull(),
  createdAt: text('created_At').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const messages = sqliteTable('messages', {
  parentMessageId: text('id').references((): AnySQLiteColumn => messages.id),
  userId: integer('id').references(() => users.id),
  id: integer('id').primaryKey({ autoIncrement: true }),
  text: text('text').notNull().unique(),
  createdAt: text('created_At').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('created_At').notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`),
})


