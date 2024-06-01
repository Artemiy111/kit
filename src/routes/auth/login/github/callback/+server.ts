import { OAuth2RequestError } from "arctic"
import { github, lucia } from "$lib/server/auth"
import { db } from '$lib/server/db'
import { eq } from 'drizzle-orm'
import { users } from '$lib/server/db/schema.js'

export async function GET({ url, cookies }) {
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const storedState = cookies.get("github_oauth_state") ?? null

  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400
    })
  }

  try {
    const tokens = await github.validateAuthorizationCode(code)
    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    })
    const githubUser: GitHubUser = await githubUserResponse.json()

    const existingUser = await db.query.users.findFirst({ where: eq(users.githubId, githubUser.id) })

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {})
      const sessionCookie = lucia.createSessionCookie(session.id)
      cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes
      })
    } else {
      const githubEmailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`
        }
      })
      const githubEmails: GithubEmail[] = await githubEmailResponse.json()
      const primary = githubEmails.find(email => email.primary)

      if (primary) {
        const created = await db.insert(users).values({
          username: githubUser.login,
          githubId: githubUser.id
        }).returning()

        const session = await lucia.createSession(created[0].id, {
          username: created[0].username,
          githubId: created[0].githubId
        })
        const sessionCookie = lucia.createSessionCookie(session.id)
        cookies.set(sessionCookie.name, sessionCookie.value, {
          path: ".",
          ...sessionCookie.attributes
        })
      }

    }
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/"
      }
    })
  } catch (e) {
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError && e.message === "bad_verification_code") {
      // invalid code
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