import { z } from 'zod'
import { addFileToMessage, createMessage, getRootMessagesTrees } from '$lib/server/repos/message.repo'
import { fail } from '@sveltejs/kit'
import { superValidate, withFiles } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import type { MessageTreeDto } from '$lib/types.js'
import { createFile } from '$lib/server/repos/file.repo.js'
import { messageMapper } from '$lib/server/mappers/message.mapper.js'


export const load = async () => {
	const messages = await getRootMessagesTrees()
	return {
		messages: messages.map(messageMapper.toDto)
	}
}

const createMessageSchema = z.object({
	text: z.string().min(1),
	authorId: z.number(),
	parentMessageId: z.string().optional(),
	images: z.array(z.instanceof(File).refine((f) => f.size < 1_000_000, 'Max 1 MB upload size.'))
})

export const actions = {
	'create-message': async ({ request }) => {
		const form = await superValidate(request, zod(createMessageSchema))

		if (!form.valid) {
			return fail(400, { form })
		}
		const data = form.data
		console.log(data)
		const createdInBucket = await Promise.all(data.images.map(async (file) => await createFile(file)))

		const message = await createMessage({
			authorId: data.authorId,
			parentMessageId: data.parentMessageId,
			text: data.text
		})

		await Promise.all(createdInBucket.map(file => addFileToMessage(message.id, file.id)))

		return withFiles({ form })
	}
}
