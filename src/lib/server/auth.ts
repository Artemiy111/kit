import { Lucia, type Session, type User } from 'lucia'
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle'
import { db } from './db'
import { users, sessions, type OauthProvider, type UserDb, type UserDbDeep } from './db/schema'
import { dev } from '$app/environment'
import { GitHub, Google, VK, Yandex } from 'arctic'
import {
	HOST,
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET,
	VK_CLIENT_ID,
	VK_CLIENT_SECRET,
	YANDEX_CLIENT_ID,
	YANDEX_CLIENT_SECRET,
	MAILRU_CLIENT_ID,
	MAILRU_CLIENT_SECRET
} from '$env/static/private'
import { OAuth2Client } from 'oslo/oauth2'
import { error } from '@sveltejs/kit'

export const github = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET)
// const google = new Google(clientId, clientSecret, redirectURI)

export const yandex = new Yandex(YANDEX_CLIENT_ID, YANDEX_CLIENT_SECRET, {
	redirectURI: `${HOST}/auth/login/yandex/callback`
})
export const vk = new VK(VK_CLIENT_ID, VK_CLIENT_SECRET, `${HOST}/login/vk/callback`)

export const mailru = new OAuth2Client(
	MAILRU_CLIENT_ID,
	'https://oauth.mail.ru/login',
	'https://oauth.mail.ru/token',
	{
		redirectURI: `${HOST}/auth/login/mailru/callback`
		// redirectURI: 'http://localhost:5173/auth/login/mailru/callback'
		// redirectURI: 'https://bit.ly/3wZlC9e'
		// redirectURI: 'https://artistick.tech/mailru/'
	}
)

const adapter = new DrizzleSQLiteAdapter(db, sessions, users) // your adapter

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes(attrs: UserDb) {
		return {
			username: attrs.username,
			email: attrs.email
		}
	}
})

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia
		UserId: number
		DatabaseUserAttributes: DatabaseUserAttributes
	}

	interface DatabaseUserAttributes extends UserDb { }
}

export function assertAuthenticated(locals: App.Locals): { session: Session, user: UserDbDeep } {
	if (!locals.session || !locals.user) error(401, { message: 'Not authenticated' })

	return {
		session: locals.session,
		user: locals.user
	}
} 