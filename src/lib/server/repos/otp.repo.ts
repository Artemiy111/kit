import { eq } from 'drizzle-orm'
import type { UserId } from 'lucia'
import { HMAC } from 'oslo/crypto'
import { createTOTPKeyURI, TOTPController } from 'oslo/otp'
import { db } from '../db'
import { users } from '../db/schema'

export async function updateTOTP(userId: UserId) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) throw new Error('User does not exist')
  const secret = await new HMAC('SHA-1').generateKey()
  console.log(new Uint8Array(secret))
  const issuer = 'Messager'
  const accountName = user.email

  const uri = createTOTPKeyURI(issuer, accountName, secret)

  await db.update(users).set({ totp: Buffer.from(secret) }).where(eq(users.id, userId))
  return uri
}

export async function verifyTOTP(userId: UserId, totp: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) throw new Error('User does not exist')
  if (!user.totp) throw Error('User does not have TOTP')

  return await new TOTPController().verify(totp, user.totp)
}
