import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import { likes, type MessageId, type UserId } from '../db/schema'

export async function isLikedMessage(userId: UserId, messageId: MessageId) {
  return await db.query.likes.findFirst({ where: and(eq(likes.userId, userId), eq(likes.messageId, messageId)) }) ? true : false
}

export async function likeMessage(userId: UserId, messageId: MessageId) {
  await db.insert(likes).values({ userId, messageId })
}

export async function unlikeMessage(userId: UserId, messageId: MessageId) {
  await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.messageId, messageId)))
}