import type { OauthProvider, UserDb, UserDbCreate, UserDbDeep, UserDto, UserId } from '$lib/types'
import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import { oauths, users, type UserDbUpdate } from '../db/schema'

export async function getUser(id: UserId) {
  return await db.query.users.findFirst({ where: eq(users.id, id), with: { oauths: true } }) || null
}
export async function getUserByEmail(email: string) {
  return await db.query.users.findFirst({ where: eq(users.email, email), with: { oauths: true } }) || null
}

export async function createUser(create: UserDbCreate) {
  return (await db.insert(users).values(create).returning())[0]
}

export async function getUserByOauth(provider: OauthProvider, providerUserId: string): Promise<UserDbDeep | null> {
  const oauth = await db.query.oauths.findFirst({
    where: and(
      eq(oauths.provider, provider),
      eq(oauths.providerUserId, providerUserId)
    ),
    with: {
      user: {
        with: {
          oauths: true
        }
      }
    }
  })
  return oauth?.user || null
}

export async function updateUser(id: UserId, update: UserDbUpdate) {
  return (await db.update(users).set(update).where(eq(users.id, id)).returning())[0]
}

export async function deleteUser(id: UserId) {
  await db.delete(users).where(eq(users.id, id))
}

