import { OAuth2RequestError } from 'arctic'
import { yandex, lucia } from '$lib/server/auth'
import { db } from '$lib/server/db'
import { oauths, users, type UserDb } from '$lib/server/db/schema.js'
import { createUser, getUserByEmail, getUserByOauth } from '$lib/server/repos/user.repo.js'
import { createOauth } from '$lib/server/repos/oauth.repo.js'

const PROVIDER = 'yandex'

export async function GET({ url, cookies, locals }) {
	const code = url.searchParams.get('code')
	const state = url.searchParams.get('state')
	const storedState = cookies.get(`${PROVIDER}_oauth_state`) ?? null
	const { user: currentUser } = locals

	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400
		})
	}

	try {
		const tokens = await yandex.validateAuthorizationCode(code)
		const yandexUserResponse = await fetch('https://login.yandex.ru/info', {
			headers: {
				Authorization: `OAuth ${tokens.accessToken}`
			}
		})
		const yandexUser: YandexUser = await yandexUserResponse.json()
		const existingUserWithOauthProvider = await getUserByOauth(PROVIDER, yandexUser.id)

		// if user with connected oauth exists -> create new session
		if (existingUserWithOauthProvider) {
			const session = await lucia.createSession(existingUserWithOauthProvider.id, {
				email: existingUserWithOauthProvider.email,
				username: existingUserWithOauthProvider.username
			})
			const sessionCookie = lucia.createSessionCookie(session.id)
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			})
			return new Response(null, {
				status: 302,
				headers: {
					Location: '/'
				}
			})
		}
		const email = yandexUser.default_email

		// if current user is logged in -> add provider to current user
		// if user with email matches provider's primary email -> merge provider's oauth with user
		// else create new user with provider's oauth
		let user: UserDb = null!
		const existingUserWithProviderEmail = await getUserByEmail(email)
		if (currentUser) {
			await createOauth({
				provider: PROVIDER,
				providerUserId: yandexUser.id,
				userId: currentUser.id
			})
			user = currentUser
		} else if (existingUserWithProviderEmail) {
			await createOauth({
				provider: PROVIDER,
				providerUserId: yandexUser.id,
				userId: existingUserWithProviderEmail.id
			})

			user = existingUserWithProviderEmail
		} else {
			user = await db.transaction(async () => {
				const createdUser = await createUser({
					username: yandexUser.login,
					email: email
				})
				await createOauth({
					userId: createdUser.id,
					provider: PROVIDER,
					providerUserId: yandexUser.id
				})
				return createdUser
			})
		}

		const session = await lucia.createSession(user.id, {
			username: user.username,
			email: user.email
		})
		const sessionCookie = lucia.createSessionCookie(session.id)
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		})

		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		})
	} catch (e) {
		if (e instanceof OAuth2RequestError) {
			return new Response(null, {
				status: 400
			})
		}
		return new Response(null, {
			status: 500
		})
	}
}

interface YandexUser {
	id: string
	login: string
	name: string
	default_email: string
	emails: string[]
}
