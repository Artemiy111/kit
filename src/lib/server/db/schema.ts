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
export type UserDbCreate = typeof users.$inferInsert
export type UserDbDeep = UserDb & {
  oauths: OauthDb[]
}
export type UserId = UserDb['id']
export type UserDto = {
  id: number,
  username: string,
  email: string | null,
  createdAt: string
  providers: OauthProvider[]
}

export const oauths = sqliteTable('user_oauths', {
  userId: integer('user_id').notNull().references(() => users.id),
  provider: text('provider', { 'enum': ['github', 'yandex', 'mailru'] }).notNull(),
  providerUserId: text('provider_user_id').notNull(),
}, t => ({
  pk: primaryKey({ 'name': 'pk', 'columns': [t.provider, t.providerUserId], })
}))

export type OauthDb = typeof oauths.$inferSelect
export type OauthDbCreate = typeof oauths.$inferSelect
export type OauthProvider = OauthDb['provider']

export const sessions = sqliteTable("user_sessions", {
  id: text("id").notNull().primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: integer("expires_at").notNull()
})

export type SessionDb = typeof sessions.$inferSelect

export const messages = sqliteTable('messages', {
  parentMessageId: text('parent_message_id').references((): AnySQLiteColumn => messages.id),
  authorId: integer('author_id').references(() => users.id),
  id: integer('id').primaryKey({ autoIncrement: true }),
  text: text('text').notNull().unique(),
  createdAt: text('created_At').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('created_At').notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`),
})

export type MessageDb = typeof messages.$inferSelect
export type MessageId = MessageDb['id']


export const usersRelations = relations(users, ({ many }) => ({
  oauths: many(oauths),
  sessions: many(sessions)
}))

export const userOauthsRelations = relations(oauths, ({ one }) => ({
  user: one(users, {
    'fields': [oauths.userId],
    'references': [users.id]
  })
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  })
}))

export const messagesRelations = relations(messages, ({ one, many }) => ({
  author: one(users, {
    'fields': [messages.authorId],
    'references': [users.id]
  }),
  parentMessage: one(messages, {
    'fields': [messages.parentMessageId],
    'references': [messages.id]
  }),

}))