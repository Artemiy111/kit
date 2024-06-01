export const load = async ({ cookies, depends, locals }) => {
  depends('app:user')
  return {
    user: locals.user
  }
}