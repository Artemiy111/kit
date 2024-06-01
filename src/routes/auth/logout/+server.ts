import { lucia } from '$lib/server/auth'
import { redirect } from '@sveltejs/kit'

export const GET = async ({ cookies, locals }) => {
  if (!locals.session) return redirect(302, '/auth/login')

  await lucia.invalidateSession(locals.session.id)
  const sessionCookie = lucia.createBlankSessionCookie()
  cookies.set(sessionCookie.name, sessionCookie.value, {
    path: ".",
    ...sessionCookie.attributes
  })

  cookies.delete('github_oauth_state', { path: '/' })

  redirect(302, '/')
}