import { OAuth2RequestError } from "arctic"
import { github, lucia } from "$lib/server/auth"
import { db } from '$lib/server/db'
import { and, eq } from 'drizzle-orm'
import { userOauths, users, type UserDb } from '$lib/server/db/schema.js'

export async function GET({ url, cookies }) {
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const storedState = cookies.get("vk_oauth_state") ?? null

  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400
    })
  }

  try {
    const tokens = await github.validateAuthorizationCode(code)
    const githubUserResponse = await fetch("https://api.vk.com/method/users.get", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    })
    const vkUser: GitHubUser = await githubUserResponse.json()
    console.log(vkUser)
    return new Response(null, { status: 200 })
    const existingUserOauthVk = await db.query.userOauths.findFirst({
      where: and(
        eq(userOauths.provider, 'vk'),
        eq(userOauths.providerUserId, String(vkUser.id))
      )
    })

    // if user with connected oauth exists -> create new session
    if (existingUserOauthVk) {
      const session = await lucia.createSession(existingUserOauthVk.userId, {})
      const sessionCookie = lucia.createSessionCookie(session.id)
      cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes
      })
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/"
        }
      })
    }

    const githubEmailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    })
    const vkEmails: GithubEmail[] = await githubEmailResponse.json()
    const primaryEmail = vkEmails.find(email => email.primary)

    if (!primaryEmail) return new Response(null, { status: 400 })

    // if user with email matches github primary email -> merge github oauth with user
    // else create new user with github oauth
    let user: UserDb = null!
    const existingUserWithVkPrimaryEmail = await db.query.users.findFirst({ where: eq(users.email, primaryEmail.email) })
    if (existingUserWithVkPrimaryEmail) {
      db.insert(userOauths).values({
        'provider': 'github',
        'providerUserId': String(vkUser.id),
        'userId': existingUserWithVkPrimaryEmail.id
      })
      user = existingUserWithVkPrimaryEmail
    } else {
      user = await db.transaction(async (tx) => {
        const createdUser = await tx.insert(users).values({
          username: vkUser.login,
          email: primaryEmail.email,
        }).returning()
        const createdOauthGithub = await tx.insert(userOauths).values({
          'userId': createdUser[0].id,
          'provider': 'github',
          'providerUserId': String(vkUser.id)
        })
        return createdUser[0]
      })
    }

    const session = await lucia.createSession(user.id, {
      username: user.username,
      email: user.email
    })
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    })

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