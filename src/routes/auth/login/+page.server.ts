import { lucia } from "$lib/server/auth"
import { db } from '$lib/server/db'
import { oauths, users } from '$lib/server/db/schema'
import { fail, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { verifySync } from '@node-rs/argon2'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3),
})

export const load = ({ locals }) => {
  if (locals.user) redirect(302, '/')
}

export const actions = {
  default: async ({ request, url, cookies }) => {
    const redirectTo = url.searchParams.get('redirect-to')
    const raw = Object.fromEntries((await request.formData()).entries())
    const parsed = registerSchema.safeParse(raw)

    if (!parsed.success) return fail(422, { success: false, message: parsed.error.issues[0].message })
    const data = parsed.data


    const existing = await db.query.users.findFirst({ 'where': eq(users.email, data.email) })
    if (!existing || existing.passwordHash === null) return fail(422, { success: false, message: 'Email or password is wrong' })

    const isValidPassword = verifySync(existing.passwordHash!, data.password)
    if (!isValidPassword) return fail(422, { success: false, message: 'Email or password is wrong' })

    const session = await lucia.createSession(existing.id, { username: existing.username })
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    })

    if (redirectTo) redirect(303, redirectTo)
    else redirect(302, '/')
  }
}