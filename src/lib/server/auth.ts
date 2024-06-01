import { Lucia } from "lucia"
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle"
import { db } from './db'
import { users, sessions, type OauthProvider } from './db/schema'
import { dev } from "$app/environment"
import { GitHub, Google, VK, Yandex } from 'arctic'
import {
  HOST,
  GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET,
  VK_CLIENT_ID, VK_CLIENT_SECRET,
  YANDEX_CLIENT_ID, YANDEX_CLIENT_SECRET
} from '$env/static/private'

export const github = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET)
// const google = new Google(clientId, clientSecret, redirectURI)

export const yandex = new Yandex(YANDEX_CLIENT_ID, YANDEX_CLIENT_SECRET, { redirectURI: `${HOST}/auth/login/yandex/callback` })
export const vk = new VK(VK_CLIENT_ID, VK_CLIENT_SECRET, `${HOST}/login/vk/callback`)

const adapter = new DrizzleSQLiteAdapter(db, sessions, users) // your adapter

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: !dev
    }
  },
  getUserAttributes(attrs) {
    return {
      username: attrs.username,
      email: attrs.email,
      providers: attrs.providers,
    }
  },
})

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia
    UserId: number
    DatabaseUserAttributes: DatabaseUserAttributes
  }

  interface DatabaseUserAttributes {
    username: string
    email: number,
    providers: OauthProvider[]
  }
}
