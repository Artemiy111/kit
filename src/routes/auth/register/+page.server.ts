import { fail, redirect } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { users } from '$lib/server/db/schema'
import { lucia } from "$lib/server/auth"
import { z } from 'zod'
import { eq } from 'drizzle-orm'
// import { password } from 'bun'
import { hashSync } from '@node-rs/argon2'
const registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(3),
  'repeat-password': z.string().min(3)
})

export const actions = {
  register: async ({ request, url, cookies }) => {
    const redirectTo = url.searchParams.get('redirect-to')
    const raw = Object.fromEntries((await request.formData()).entries())
    const parsed = registerSchema.safeParse(raw)

    if (!parsed.success) return fail(422, { success: false, message: parsed.error.issues[0].message })

    const data = parsed.data
    if (data.password !== data['repeat-password']) return fail(422, { success: false, message: 'Passwords don\'t match' })

    const passwordHash = hashSync(data.password)

    const existing = await db.query.users.findFirst({ 'where': eq(users.username, data.username) })
    if (existing) return fail(422, { success: false, message: 'User with this name is already exists' })

    const created = await db.insert(users).values({
      username: data.username,
      passwordHash,
    }).returning()

    const session = await lucia.createSession(created[0].id, { username: created[0].username })
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    })
    if (redirectTo) redirect(302, redirectTo)
    return { success: true }
  }
}