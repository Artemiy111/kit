import { redirect } from '@sveltejs/kit'
import { generateState } from 'arctic'
import { mailru } from '$lib/server/auth'

export async function GET({ cookies }) {
	const state = generateState()
	const url = await mailru.createAuthorizationURL({
		state,
		scopes: ['userinfo']
	})

	cookies.set('mailru_oauth_state', state, {
		path: '/',
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	})

	return redirect(302, url)
}
