import { relations, sql } from 'drizzle-orm'
import {
	text,
	integer,
	sqliteTable,
	foreignKey,
	type AnySQLiteColumn,
	primaryKey
} from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	username: text('username').notNull(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash'),
	createdAt: text('created_At')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
})

export type UserDb = typeof users.$inferSelect
export type UserDbCreate = typeof users.$inferInsert
export type UserDbUpdate = {
	email: string
}
export type UserDbDeep = UserDb & {
	oauths: OauthDb[]
}
export type UserId = UserDb['id']
export type UserDto = {
	id: number
	username: string
	email: string | null
	createdAt: string
	providers: OauthProvider[]
}

export const oauths = sqliteTable(
	'oauths',
	{
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
		provider: text('provider', { enum: ['github', 'yandex', 'mailru'] }).notNull(),
		providerUserId: text('provider_user_id').notNull()
	},
	(t) => ({
		pk: primaryKey({ name: 'pk', columns: [t.provider, t.providerUserId] })
	})
)

export type OauthDb = typeof oauths.$inferSelect
export type OauthDbCreate = typeof oauths.$inferSelect
export type OauthProvider = OauthDb['provider']

export const sessions = sqliteTable('sessions', {
	id: text('id').notNull().primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
	expiresAt: integer('expires_at').notNull()
})

export type SessionDb = typeof sessions.$inferSelect

export const messages = sqliteTable('messages', {
	parentMessageId: integer('parent_message_id').references((): AnySQLiteColumn => messages.id, {
		onUpdate: 'cascade',
		onDelete: 'cascade'
	}),
	authorId: integer('author_id')
		.notNull()
		.references(() => users.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
	id: integer('id').primaryKey({ autoIncrement: true }),
	text: text('text').notNull(),
	createdAt: text('created_At')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('created_At')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
		.$onUpdate(() => sql`CURRENT_TIMESTAMP`)
})

export type MessageDb = typeof messages.$inferSelect
export type MessageDbCreate = typeof messages.$inferInsert
export type MessageDbDeep = MessageDb & {
	author: UserDb
	files: MessageToFileDbWithFile[]
}
export type MessageDbTree = MessageDbDeep & {
	replies: MessageDbTree[]
}
export type MessageDbTreeDto = MessageDbTree
export type MessageId = MessageDb['id']
export type MessageDto = MessageDb

export const messagesToFiles = sqliteTable(
	'messages_to_files',
	{
		messageId: integer('message_id')
			.notNull()
			.references(() => messages.id),
		fileId: integer('file_id')
			.notNull()
			.references(() => files.id)
	},
	(t) => ({
		pk: primaryKey({ name: 'pk_message_id_to_file_id', columns: [t.messageId, t.fileId] })
	})
)

export type MessageToFileDb = typeof messagesToFiles.$inferInsert
export type MessageToFileDbWithFile = MessageToFileDb & {
	file: FileDb
}

export const files = sqliteTable('files', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title'),
	url: text('url').notNull()
})

export type FileDb = typeof files.$inferSelect
export type FileDbCreate = typeof files.$inferInsert
export type FIleId = FileDb['id']

export const usersRelations = relations(users, ({ many }) => ({
	oauths: many(oauths),
	sessions: many(sessions)
}))

export const userOauthsRelations = relations(oauths, ({ one }) => ({
	user: one(users, {
		fields: [oauths.userId],
		references: [users.id]
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
		fields: [messages.authorId],
		references: [users.id]
	}),
	parentMessage: one(messages, {
		fields: [messages.parentMessageId],
		references: [messages.id]
	}),
	replies: many(messages),
	files: many(messagesToFiles)
}))

export const messagesToFilesRelations = relations(messagesToFiles, ({ one }) => ({
	message: one(messages, {
		fields: [messagesToFiles.messageId],
		references: [messages.id]
	}),
	file: one(files, {
		fields: [messagesToFiles.fileId],
		references: [files.id]
	})
}))
