import { OAuth2RequestError } from "arctic"
import { mailru, lucia } from "$lib/server/auth"
import { db } from '$lib/server/db'
import { and, eq } from 'drizzle-orm'
import { oauths, users, type UserDb } from '$lib/server/db/schema.js'
import { MAILRU_CLIENT_SECRET } from '$env/static/private'

export async function GET({ url, cookies }) {
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const storedState = cookies.get("mailru_oauth_state") ?? null

  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400
    })
  }

  try {
    const tokens = await mailru.validateAuthorizationCode(code, {
      credentials: MAILRU_CLIENT_SECRET
    })
    const mailruUserResponse = await fetch(`https://oauth.mail.ru/userinfo?access_token=${tokens.access_token}`)
    const mailruUser: MailruUser = await mailruUserResponse.json()

    const existingUserOauthMailru = await db.query.userOauths.findFirst({
      where: and(
        eq(oauths.provider, 'mailru'),
        eq(oauths.providerUserId, mailruUser.id)
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
    if (existingUserOauthMailru) {
      const session = await lucia.createSession(existingUserOauthMailru.userId, {
        email: existingUserOauthMailru.user.email,
        username: existingUserOauthMailru.user.username,
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
    const primaryEmail = mailruUser.email

    // if user with email matches github primary email -> merge github oauth with user
    // else create new user with github oauth
    let user: UserDb = null!
    const existingUserWithMailruPrimaryEmail = await db.query.users.findFirst({ where: eq(users.email, primaryEmail) })
    if (existingUserWithMailruPrimaryEmail) {
      db.insert(oauths).values({
        provider: 'mailru',
        providerUserId: mailruUser.id,
        userId: existingUserWithMailruPrimaryEmail.id
      })
      user = existingUserWithMailruPrimaryEmail
    } else {
      user = await db.transaction(async (tx) => {
        const createdUser = await tx.insert(users).values({
          username: mailruUser.nickname,
          email: primaryEmail,
        }).returning()
        const createdOauthYandex = await tx.insert(oauths).values({
          userId: createdUser[0].id,
          provider: 'mailru',
          providerUserId: String(mailruUser.id)
        })
        return createdUser[0]
      })
    }

    const session = await lucia.createSession(user.id, {
      username: user.username,
      email: user.email,
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

interface MailruUser {
  id: string
  nickname: string
  name: string
  image: string
  email: string
}