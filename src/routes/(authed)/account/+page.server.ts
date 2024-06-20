import { assertAuthenticated } from '$lib/server/auth.js'
import { deleteOauth, getAllOauthsByUserId } from '$lib/server/repos/oauth.repo.js'
import { fail } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

const removeProviderSchema = z.object({
  provider: z.enum(['github', 'mailru', 'yandex'])
})


export const actions = {
  'remove-provider': async ({ request, locals }) => {
    const { user } = assertAuthenticated(locals)
    const form = await superValidate(request, zod(removeProviderSchema))
    if (!form.valid) return fail(400, { form })
    const { data } = form
    const providers = await getAllOauthsByUserId(user.id)
    if (providers.length <= 1) return fail(400, { form })
    await deleteOauth(user.id, data.provider)
    return { form }
  }
}