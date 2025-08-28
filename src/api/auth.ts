import { removeStorage, setStorage } from '@/lib/storage'
import { request } from '../lib/request'

// 使用 alovajs 重构登录功能
export async function login(userName: string, password: string) {
  const { token, user } = await request.Post<LoginResponse>('/auth/login', {
    userName,
    password,
  })

  if (token) setStorage('kiwi:user:token', token)
  if (user) setStorage('kiwi:user:data', user)
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
    removeStorage('kiwi:user:token')
  }
}

export async function generateSsoCode() {
  const { code } = await request.Post<{ code: string }>(
    '/auth/generate-sso-code'
  )
  return code
}
