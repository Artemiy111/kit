import { z } from 'zod'
import { createMessage, getRootMessagesTrees } from '$lib/server/repos/message.repo'
import { fail } from '@sveltejs/kit'
import { invalidate } from '$app/navigation'

export const load = async ({ depends }) => {
  depends('app:massages')
  const messages = await getRootMessagesTrees()
  return {
    messages
  }
}

const createMessageSchema = z.object({
  text: z.string(),
  authorId: z.string(),
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
      text: data.text
    })
    console.log('created')
    invalidate('app:messages')
  }
}