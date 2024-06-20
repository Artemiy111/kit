import { userMapper } from '$lib/server/mappers/user.mapper'

export const load = async ({ cookies, locals }) => {
	console.log(locals.user?.email || 'nope')
	return {
		user: locals.user === null ? null : userMapper.toDto(locals.user),
	}
}
