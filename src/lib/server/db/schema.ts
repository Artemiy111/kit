import { relations, sql } from "drizzle-orm"
import { text, integer, sqliteTable, foreignKey, type AnySQLiteColumn } from "drizzle-orm/sqlite-core"

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().notNull().unique(),
  githubId: integer('github_id').unique(),
  passwordHash: text('password_hash'),
  createdAt: text('created_At').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const sessions = sqliteTable("sessions", {
  id: text("id").notNull().primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: integer("expires_at").notNull()
})

export const messages = sqliteTable('messages', {
  parentMessageId: text('parent_message_id').references((): AnySQLiteColumn => messages.id),
  userId: integer('id').references(() => users.id),
  id: integer('id').primaryKey({ autoIncrement: true }),
  text: text('text').notNull().unique(),
  createdAt: text('created_At').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('created_At').notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`),
})


