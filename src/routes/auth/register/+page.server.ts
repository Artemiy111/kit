import { fail, redirect } from '@sveltejs/kit'
import { lucia } from '$lib/server/auth'
import { z } from 'zod'
import { Argon2id } from 'oslo/password'
import { createUser, getUserByEmail } from '$lib/server/repos/user.repo.js'

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

		if (!parsed.success)
			return fail(422, { success: false, message: parsed.error.issues[0].message })

		const { data } = parsed
		if (data.password !== data['repeat-password'])
			return fail(422, { success: false, message: "Passwords don't match" })

		const passwordHash = await new Argon2id().hash(data.password)

		const existingUserWithEmail = await getUserByEmail(data.email)
		if (existingUserWithEmail)
			return fail(422, { success: false, message: 'User with this email is already exists' })

		const created = await createUser({
			username: data.username,
			email: data.email,
			passwordHash
		})

		const session = await lucia.createSession(created.id, {
			email: created.email,
			username: created.username,
			providers: []
		})
		const sessionCookie = lucia.createSessionCookie(session.id)
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes
		})

		if (redirectTo) redirect(302, redirectTo)
		return redirect(302, '/')
	}
}
