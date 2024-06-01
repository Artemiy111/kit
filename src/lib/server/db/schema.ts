import { relations, sql } from "drizzle-orm"
import { text, integer, sqliteTable, foreignKey, type AnySQLiteColumn, primaryKey } from "drizzle-orm/sqlite-core"

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  createdAt: text('created_At').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export type UserDb = typeof users.$inferSelect

export const userOauths = sqliteTable('user_oauths', {
  userId: integer('user_id').notNull().references(() => users.id),
  provider: text('provider', { 'enum': ['github'] }).notNull(),
  providerUserId: text('provider_user_id').notNull(),
}, t => ({
  pk: primaryKey({ 'name': 'pk', 'columns': [t.provider, t.providerUserId], })
}))

export type UserOauthDb = typeof userOauths.$inferSelect

export const sessions = sqliteTable("sessions", {
  id: text("id").notNull().primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: integer("expires_at").notNull()
})

export type SessionDb = typeof sessions.$inferSelect

export const messages = sqliteTable('messages', {
  parentMessageId: text('parent_message_id').references((): AnySQLiteColumn => messages.id),
  userId: integer('id').references(() => users.id),
  id: integer('id').primaryKey({ autoIncrement: true }),
  text: text('text').notNull().unique(),
  createdAt: text('created_At').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('created_At').notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`),
})

export type MessageDb = typeof messages.$inferSelect


