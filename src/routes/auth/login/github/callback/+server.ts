import { OAuth2RequestError } from 'arctic'
import { github, lucia } from '$lib/server/auth'
import { db } from '$lib/server/db'
import { type UserDb } from '$lib/server/db/schema.js'
import { createUser, getUserByEmail, getUserByOauth } from '$lib/server/repos/user.repo.js'
import { createOauth } from '$lib/server/repos/oauth.repo.js'

const PROVIDER = 'github'

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
		const tokens = await github.validateAuthorizationCode(code)
		const githubUserResponse = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		})
		const githubUser: GitHubUser = await githubUserResponse.json()
		const existingUserWithOauthProvider = await getUserByOauth(PROVIDER, String(githubUser.id))

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

		const githubEmailResponse = await fetch('https://api.github.com/user/emails', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		})
		const githubEmails: GithubEmail[] = await githubEmailResponse.json()
		const email = githubEmails.find((email) => email.primary)

		if (!email) return new Response(null, { status: 400 })

		// if user with email matches provider's primary email -> merge provider's oauth with user
		// else create new user with provider's oauth
		let user: UserDb = null!

		const existingUserWithProviderEmail = await getUserByEmail(email.email)
		if (existingUserWithProviderEmail) {
			await createOauth({
				provider: PROVIDER,
				providerUserId: String(githubUser.id),
				userId: existingUserWithProviderEmail.id
			})
			user = existingUserWithProviderEmail
		} else {
			user = await db.transaction(async () => {
				const createdUser = await createUser({
					username: githubUser.login,
					email: email.email
				})
				await createOauth({
					userId: createdUser.id,
					provider: PROVIDER,
					providerUserId: String(githubUser.id)
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

interface GitHubUser {
	id: number
	login: string
	avatar_url: string
	name: string
}

interface GithubEmail {
	email: string
	primary: boolean
	verified: boolean
	visibility: string | null
}
