import { lucia } from '$lib/server/auth'
import { verifyTOTP } from '$lib/server/repos/otp.repo'
import { error, fail, redirect } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

const verificationSchema = z.object({
  totp: z.string().length(6)
})
export const actions = {
  'verify': async ({ request, cookies }) => {
    const userIdNeedTotp = cookies.get('user_id_need_totp') ? Number(cookies.get('user_id_need_totp')) : null
    const form = await superValidate(request, zod(verificationSchema))
    console.log(userIdNeedTotp, form.data)
    if (!form.valid || !userIdNeedTotp) return fail(400)
    const { data } = form
    const verified = await verifyTOTP(userIdNeedTotp, data.totp)
    if (verified) {
      const session = await lucia.createSession(userIdNeedTotp, {})
      const sessionCookie = lucia.createSessionCookie(session.id)
      cookies.set(sessionCookie.name, sessionCookie.value, {
        path: '/',
        ...sessionCookie.attributes
      })
      redirect(302, '/')
    }
    return fail(400)
  }
}