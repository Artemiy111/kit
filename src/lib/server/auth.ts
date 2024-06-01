import { Lucia } from "lucia"
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle"
import { db } from './db'
import { users, sessions } from './db/schema'
import { dev } from "$app/environment"
import { GitHub } from 'arctic'
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private'

export const github = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET)

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
      email: attrs.email
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
  }
}
