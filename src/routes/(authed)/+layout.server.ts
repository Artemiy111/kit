import { redirect } from '@sveltejs/kit'

export const load = async ({ parent, url, locals }) => {
  const parentData = await parent()
  if (!locals.user) redirect(302, `/user/sign-in?redirect-to=${url.pathname}`)
  return {
    ...parentData,
    user: parentData.user!
  }
}