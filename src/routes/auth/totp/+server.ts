import { updateTOTP } from '$lib/server/repos/otp.repo'
import { error, json } from '@sveltejs/kit'
import { z } from 'zod'

const totpSchema = z.object({
  userId: z.number()
})


export const POST = async ({ request }) => {
  const body = totpSchema.safeParse(await request.json())
  if (!body.success) error(400)
  const { data } = body
  const uri = await updateTOTP(data.userId)
  return json({ uri })
}