import { assertAuthenticated } from '$lib/server/auth.js'
import { deleteUser } from '$lib/server/repos/user.repo.js'

export const DELETE = async ({ params, request, cookies, locals, fetch }) => {
	assertAuthenticated(locals)
	await deleteUser(Number(params.id))
	await fetch('/auth/logout')
	return new Response(null, { status: 204 })
}
