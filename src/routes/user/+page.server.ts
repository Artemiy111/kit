export const actions = {
  'sign-out': ({ cookies }) => {
    cookies.delete('user_id', { path: '/' })
    return {
      success: true
    }
  }
}