export const GET = ({ cookies }) => {
  cookies.delete('user_id', { path: '/' })
  return new Response()
}