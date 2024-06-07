import { z } from 'zod'
import { createMessage, getRootMessagesTrees } from '$lib/server/repos/message.repo'
import { fail } from '@sveltejs/kit'
import { userMapper } from '$lib/server/mappers/user.mapper.js'

export const load = async ({ parent }) => {
	const messages = await getRootMessagesTrees()
	return {
		user: userMapper.toDto((await parent()).user),
		messages
	}
}

const createMessageSchema = z.object({
	text: z.string(),
	authorId: z.string(),
	parentMessageId: z.string()
})

export const actions = {
	'create-message': async ({ request }) => {
		const raw = Object.fromEntries((await request.formData()).entries())
		console.log(raw)
		const _data = createMessageSchema.safeParse(raw)
		if (!_data.success) return fail(400)
		const data = _data.data
		console.log(data)
		await createMessage({
			authorId: +data.authorId,
			parentMessageId: data.parentMessageId === '' ? null : +data.parentMessageId,
			text: data.text
		})
		return {
			success: true
		}
	}
}
