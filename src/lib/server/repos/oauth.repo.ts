import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import {
	oauths,
	type OauthDb,
	type OauthDbCreate,
	type OauthProvider,
	type UserId
} from '../db/schema'


export async function getAllOauthsByUserId(userId: UserId) {
	return (await db.query.oauths.findMany({ where: eq(oauths.userId, userId) }))
}

export async function createOauth(create: OauthDbCreate) {
	return (await db.insert(oauths).values(create).returning())[0]
}

export async function deleteOauth(userId: UserId, provider: OauthProvider) {
	await db.delete(oauths).where(and(eq(oauths.userId, userId), eq(oauths.provider, provider)))
}
