import { db } from '$lib/server/db/index.js'
import { users } from '$lib/server/db/schema.js'
import { error, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

export const load = async ({ cookies }) => {
  const id = cookies.get('user_id')
  if (!id) return {
    user: null
  }
  const user = await db.query.users.findFirst({ where: eq(users.id, Number(id)) })
  return {
    user: user || null
  }
}