import { lucia } from '$lib/server/auth'
import { db } from '$lib/server/db'
import { oauths, users } from '$lib/server/db/schema'
import { fail, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { Argon2id } from 'oslo/password'
import { superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(3)
})

export const load = ({ locals }) => {
	if (locals.user) redirect(302, '/')
}

export const actions = {
	default: async ({ request, url, cookies }) => {
		const redirectTo = url.searchParams.get('redirect-to')
		const form = await superValidate(request, zod(loginSchema))
		if (!form.valid) return fail(400, { form })

		const { data } = form

		const existing = await db.query.users.findFirst({ where: eq(users.email, data.email) })
		if (!existing || existing.passwordHash === null)
			return fail(400, { form })

		const isValidPassword = await new Argon2id().verify(existing.passwordHash, data.password)
		if (!isValidPassword)
			return fail(400, { form })

		if (existing.totp) {
			cookies.set('user_id_need_totp', existing.id.toString(), {
				path: '/',
				maxAge: 5 * 60
			})
			redirect(302, '/auth/totp')
		}

		const session = await lucia.createSession(existing.id, { username: existing.username })
		const sessionCookie = lucia.createSessionCookie(session.id)
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		})

		if (redirectTo) redirect(303, redirectTo)
		else redirect(302, '/')
	}
}
