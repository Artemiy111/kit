import { db } from '../db'
import { oauths, type OauthDb, type OauthDbCreate } from '../db/schema'

export async function createOauth(create: OauthDbCreate) {
  return (await db.insert(oauths).values(create).returning())[0]
}
