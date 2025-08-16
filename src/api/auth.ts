import { request } from '../lib/request'

interface LoginResponse {
  token: string
}

// 使用 alovajs 重构登录功能
export async function login(userName: string, password: string) {
  const { token } = await request.Post<LoginResponse>('/auth/login', {
    userName,
    password,
  })

  if (token) localStorage.setItem('authToken', token)
}

export function register(userName: string, password: string) {
  return request.Post<void>('/auth/register', {
    userName,
    password,
  })
}

export async function logout() {
  try {
    await request.Post<void>('/auth/logout')
  } catch (error) {
    console.error('Logout API call failed, but clearing token anyway.', error)
  } finally {
    localStorage.removeItem('authToken')
  }
}

export async function generateSsoCode() {
  const { code } = await request.Post<{ code: string }>(
    '/auth/generate-sso-code'
  )
  return code
}
