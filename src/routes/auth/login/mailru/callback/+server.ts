import { OAuth2RequestError } from 'arctic'
import { mailru, lucia } from '$lib/server/auth'
import { db } from '$lib/server/db'
import { type UserDb } from '$lib/server/db/schema'
import { MAILRU_CLIENT_SECRET } from '$env/static/private'
import { createUser, getUserByEmail, getUserByOauth } from '$lib/server/repos/user.repo'
import { createOauth } from '$lib/server/repos/oauth.repo'

const PROVIDER = 'mailru'

export async function GET({ url, cookies }) {
	const code = url.searchParams.get('code')
	const state = url.searchParams.get('state')
	const storedState = cookies.get(`${PROVIDER}_oauth_state`) ?? null

	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400
		})
	}

	try {
		const tokens = await mailru.validateAuthorizationCode(code, {
			credentials: MAILRU_CLIENT_SECRET
		})
		const mailruUserResponse = await fetch(
			`https://oauth.mail.ru/userinfo?access_token=${tokens.access_token}`
		)
		const mailruUser: MailruUser = await mailruUserResponse.json()

		const existingUserWithOauthProvider = await getUserByOauth(PROVIDER, mailruUser.id)

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
		const email = mailruUser.email

		// if user with email matches provider's primary email -> merge provider's oauth with user
		// else create new user with provider's oauth
		let user: UserDb = null!
		const existingUserWithProviderEmail = await getUserByEmail(email)
		if (existingUserWithProviderEmail) {
			await createOauth({
				provider: PROVIDER,
				providerUserId: mailruUser.id,
				userId: existingUserWithProviderEmail.id
			})
			user = existingUserWithProviderEmail
		} else {
			user = await db.transaction(async () => {
				const createdUser = await createUser({
					username: mailruUser.nickname,
					email: email
				})
				await createOauth({
					userId: createdUser.id,
					provider: PROVIDER,
					providerUserId: String(mailruUser.id)
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

interface MailruUser {
	id: string
	nickname: string
	name: string
	image: string
	email: string
}
