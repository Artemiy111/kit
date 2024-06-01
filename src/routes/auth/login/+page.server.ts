import { lucia } from "$lib/server/auth"
import { db } from '$lib/server/db'
import { users } from '$lib/server/db/schema'
import { fail, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { verifySync } from '@node-rs/argon2'

const registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(3),
})

export const actions = {
  'sign-in': async ({ request, url, cookies }) => {
    const redirectTo = url.searchParams.get('redirect-to')
    const raw = Object.fromEntries((await request.formData()).entries())
    console.log(request)
    const parsed = registerSchema.safeParse(raw)

    if (!parsed.success) return fail(422, { success: false, message: parsed.error.issues[0].message })
    const data = parsed.data

    const existing = await db.query.users.findFirst({ 'where': eq(users.username, data.username) })
    if (!existing) return fail(422, { success: false, message: 'The data was entered incorrectly' })

    const isValidPassword = verifySync(existing.passwordHash, data.password)
    if (!isValidPassword) return fail(422, { success: false, message: 'The data was entered incorrectly' })

    const session = await lucia.createSession(existing.id, { username: existing.username })
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    })

    if (redirectTo) redirect(303, redirectTo)
    else redirect(302, '/')
    return { success: true }
  }
}