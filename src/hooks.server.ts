import { lucia } from "$lib/server/auth"
import { getUser } from '$lib/server/repos/user.repo'

export const handle = async ({ event, resolve }) => {
  const { cookies, locals } = event

  const sessionId = cookies.get(lucia.sessionCookieName)
  if (!sessionId) {
    locals.user = null
    locals.session = null
    return resolve(event)
  }

  const { session, user: sessionUser } = await lucia.validateSession(sessionId)
  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    })
  }

  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie()
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    })
  }
  if (sessionUser) {
    const user = await getUser(sessionUser.id)
    locals.user = user
  }
  locals.session = session
  return resolve(event)
}