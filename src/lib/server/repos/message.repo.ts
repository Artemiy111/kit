import { eq, isNull } from 'drizzle-orm'
import { db } from '../db'
import {
	messages,
	type MessageDb,
	type MessageDbCreate,
	type MessageDbTree,
	type MessageDbDeep,
	type MessageId,
	type FIleId,
	messagesToFiles
} from '../db/schema'

export async function getRootMessages(offset?: number, limit?: number): Promise<MessageDbDeep[]> {
	return await db.query.messages.findMany({
		offset,
		limit,
		where: isNull(messages.parentMessageId),
		with: { author: true, files: { with: { file: true } } }
	})
}

export async function getRootMessagesTrees(
	offset?: number,
	limit?: number
): Promise<MessageDbTree[]> {
	const ids = await db.query.messages.findMany({
		offset,
		limit,
		where: isNull(messages.parentMessageId),
		columns: { id: true }
	})

	const trees = await Promise.all(ids.map(async (id) => (await getMessageTree(id.id))!))
	return trees
}

export async function getMessage(id: MessageId) {
	return (
		(await db.query.messages.findFirst({
			where: eq(messages.id, id),
			with: { author: true, files: { with: { file: true } } }
		})) || null
	)
}

export async function getReplies(id: MessageId): Promise<MessageDbDeep[]> {
	return await db.query.messages.findMany({
		where: eq(messages.parentMessageId, id),
		with: { author: true, files: { with: { file: true } } }
	})
}

export async function getMessageTree(id: MessageId): Promise<MessageDbTree | null> {
	const message = await getMessage(id)
	if (!message) return null

	const replies = await getReplies(id)

	const dfs = async (message: MessageDbDeep, replies: MessageDbDeep[]): Promise<MessageDbTree> => {
		const rs = await Promise.all(replies.map(async (r) => dfs(r, await getReplies(r.id))))
		const tree: MessageDbTree = {
			...message,

			replies: rs
		}
		return tree
	}

	return dfs(message, replies)
}

export async function createMessage(create: MessageDbCreate) {
	return (await db.insert(messages).values(create).returning())[0]
}

export async function addFileToMessage(messageId: MessageId, fileId: FIleId) {
	return (await db.insert(messagesToFiles).values({ messageId, fileId }).returning())[0]
}
