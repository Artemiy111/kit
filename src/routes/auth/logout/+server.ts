import { assertAuthenticated, lucia } from '$lib/server/auth'
import { redirect } from '@sveltejs/kit'

export const GET = async ({ cookies, locals }) => {
	const { session } = assertAuthenticated(locals)
	await lucia.invalidateSession(session.id)
	const sessionCookie = lucia.createBlankSessionCookie()
	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	})

	cookies.delete('github_oauth_state', { path: '/' })
	cookies.delete('vk_oauth_state', { path: '/' })
	cookies.delete('yandex_oauth_state', { path: '/' })
	cookies.delete('mailru_oauth_state', { path: '/' })
	cookies.delete('user_id_need_totp', { path: '/' })
	redirect(302, '/')
}
