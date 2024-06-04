import { userMapper } from '$lib/server/mappers/user.mapper.js'
import { redirect } from '@sveltejs/kit'

export const load = async ({ parent, url, locals }) => {
  const parentData = await parent()
  if (!locals.user) redirect(302, `/auth/login?redirect-to=${url.pathname}`)
  return {
    ...parentData,
    user: userMapper.toDto(parentData.user!)
  }
}