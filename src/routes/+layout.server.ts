import { userMapper } from '$lib/server/mappers/user.mapper'

export const load = async ({ cookies, locals }) => {
	return {
		user: locals.user === null ? null : userMapper.toDto(locals.user),
	}
}
