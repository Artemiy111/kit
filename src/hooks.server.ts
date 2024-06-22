import { lucia } from '$lib/server/auth'
import { getUser } from '$lib/server/repos/user.repo'
import type { Cookies } from '@sveltejs/kit'

async function validateSession(cookies: Cookies) {
	const sessionId = cookies.get(lucia.sessionCookieName)
	if (!sessionId) {
		return {
			session: null,
			user: null
		}
	}

	const { session, user: sessionUser } = await lucia.validateSession(sessionId)
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id)
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		})
	}

	if (!session || !sessionUser) {
		const sessionCookie = lucia.createBlankSessionCookie()
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		})
		return {
			session: null,
			user: null
		}
	}
	const user = await getUser(sessionUser!.id)
	return {
		session,
		user
	}
}

export const handle = async ({ event, resolve }) => {
	const { cookies, locals } = event

	const { user, session } = await validateSession(cookies)
	locals.session = session
	locals.user = user
	return resolve(event)
}
