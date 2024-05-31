import { db } from '$lib/server/db'
import { users } from '$lib/server/db/schema'
import { error, fail, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'

const registerSchema = z.object({
  name: z.string().min(3),
  password: z.string().min(3),
  'repeat-password': z.string().min(3)
})

export const actions = {
  register: async ({ request, url, cookies }) => {
    const redirectTo = url.searchParams.get('redirect-to')
    const raw = Object.fromEntries((await request.formData()).entries())
    const parsed = registerSchema.safeParse(raw)

    if (!parsed.success) return fail(400, { message: parsed.error.issues[0].message })

    const data = parsed.data
    const passwordSalt = bcrypt.genSaltSync()
    const passwordHash = bcrypt.hashSync(data.password, passwordSalt)

    const existing = await db.query.users.findFirst({ 'where': eq(users.name, data.name) })
    if (existing) return fail(400, { message: 'User with this name is already exists' })

    const created = await db.insert(users).values({
      name: data.name,
      passwordHash,
      passwordSalt
    }).returning()
    cookies.set('user_id', created[0].id.toString(), { 'path': '/' })
    if (redirectTo) redirect(303, redirectTo)
  }
}