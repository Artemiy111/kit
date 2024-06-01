import { fail, redirect } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { userOauths, users, type UserDb } from '$lib/server/db/schema'
import { lucia } from "$lib/server/auth"
import { z } from 'zod'
import { and, eq, isNotNull, isNull } from 'drizzle-orm'
import { hashSync } from '@node-rs/argon2'

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(3),
  'repeat-password': z.string().min(3)
})

export const actions = {
  default: async ({ request, url, cookies }) => {
    const redirectTo = url.searchParams.get('redirect-to')
    const raw = Object.fromEntries((await request.formData()).entries())
    const parsed = registerSchema.safeParse(raw)

    if (!parsed.success) return fail(422, { success: false, message: parsed.error.issues[0].message })

    const data = parsed.data
    if (data.password !== data['repeat-password']) return fail(422, { success: false, message: 'Passwords don\'t match' })

    const passwordHash = hashSync(data.password)

    const existingUserWithPassword = await db.query.users.findFirst({
      'where': and(
        isNotNull(users.passwordHash),
        eq(users.email, data.email)
      )
    })
    // if user with password already exists -> fail
    if (existingUserWithPassword) return fail(422, { success: false, message: 'User with this email is already exists' })

    // if exists user with this email without password -> add password to existing user with some oauth providers
    // else create new user with password
    let user: UserDb = null!
    const existingUserWithEmailWithoutPassword = await db.query.users.findFirst({
      where: and(
        isNull(users.passwordHash),
        eq(users.email, data.email)
      )
    })
    if (existingUserWithEmailWithoutPassword) {
      await db.update(users).set({
        passwordHash,
      })
      user = existingUserWithEmailWithoutPassword
    } else {
      const created = await db.insert(users).values({
        username: data.username,
        email: data.email,
        passwordHash,
      }).returning()
      user = created[0]
    }

    const userProviders = (await db.query.userOauths.findMany({
      where: eq(userOauths.userId, user.id)
    })).map(o => o.provider)

    const session = await lucia.createSession(user.id, {
      email: user.email,
      username: user.username,
      providers: userProviders
    })
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    })
    if (redirectTo) redirect(302, redirectTo)
    return redirect(302, '/')
  }
}