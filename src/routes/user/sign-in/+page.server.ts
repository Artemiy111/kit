import { db } from '$lib/server/db'
import { users } from '$lib/server/db/schema'
import { fail, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'

const registerSchema = z.object({
  name: z.string().min(3),
  password: z.string().min(3),
})

export const actions = {
  'sign-in': async ({ request, url, cookies }) => {
    const redirectTo = url.searchParams.get('redirect-to')
    const raw = Object.fromEntries((await request.formData()).entries())
    console.log(request)
    const parsed = registerSchema.safeParse(raw)

    if (!parsed.success) return fail(422, { success: false, message: parsed.error.issues[0].message })
    const data = parsed.data

    const existing = await db.query.users.findFirst({ 'where': eq(users.name, data.name) })
    if (!existing) return fail(422, { success: false, message: 'The data was entered incorrectly' })

    const isValidPassword = bcrypt.compareSync(data.password, existing.passwordHash)
    if (!isValidPassword) return fail(422, { success: false, message: 'The data was entered incorrectly' })

    cookies.set('user_id', existing.id.toString(), { 'path': '/' })
    if (redirectTo) redirect(303, redirectTo)
    return { success: true }
  }
}