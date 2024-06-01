import { OAuth2RequestError } from "arctic"
import { yandex, lucia } from "$lib/server/auth"
import { db } from '$lib/server/db'
import { and, eq } from 'drizzle-orm'
import { userOauths, users, type UserDb } from '$lib/server/db/schema.js'

export async function GET({ url, cookies }) {
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const storedState = cookies.get("yandex_oauth_state") ?? null

  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400
    })
  }

  try {
    const tokens = await yandex.validateAuthorizationCode(code)
    const yandexUserResponse = await fetch("https://login.yandex.ru/info", {
      headers: {
        Authorization: `OAuth ${tokens.accessToken}`
      }
    })
    const yandexUser: YandexUser = await yandexUserResponse.json()
    const existingUserOauthYandex = await db.query.userOauths.findFirst({
      where: and(
        eq(userOauths.provider, 'yandex'),
        eq(userOauths.providerUserId, yandexUser.id)
      ),
      with: {
        'user': {
          'with': {
            'oauths': true
          }
        }
      }
    })

    // if user with connected oauth exists -> create new session
    if (existingUserOauthYandex) {
      const session = await lucia.createSession(existingUserOauthYandex.userId, {
        email: existingUserOauthYandex.user.email,
        username: existingUserOauthYandex.user.username,
        providers: existingUserOauthYandex.user.oauths.map(o => o.provider)
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
    }
    const primaryEmail = yandexUser.default_email

    // if user with email matches github primary email -> merge github oauth with user
    // else create new user with github oauth
    let user: UserDb = null!
    const existingUserWithYandexPrimaryEmail = await db.query.users.findFirst({ where: eq(users.email, primaryEmail) })
    if (existingUserWithYandexPrimaryEmail) {
      db.insert(userOauths).values({
        'provider': 'github',
        'providerUserId': yandexUser.id,
        'userId': existingUserWithYandexPrimaryEmail.id
      })
      user = existingUserWithYandexPrimaryEmail
    } else {
      user = await db.transaction(async (tx) => {
        const createdUser = await tx.insert(users).values({
          username: yandexUser.login,
          email: primaryEmail,
        }).returning()
        const createdOauthYandex = await tx.insert(userOauths).values({
          'userId': createdUser[0].id,
          'provider': 'github',
          'providerUserId': String(yandexUser.id)
        })
        return createdUser[0]
      })
    }
    const providers = (await db.query.userOauths.findMany({ where: eq(userOauths.userId, user.id) })).map(o => o.provider)

    const session = await lucia.createSession(user.id, {
      username: user.username,
      email: user.email,
      providers
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

interface YandexUser {
  id: string
  login: string
  name: string
  default_email: string
  emails: string[]
}