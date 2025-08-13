import { createAlova } from 'alova'
import adapterFetch from 'alova/fetch'
import reactHook from 'alova/react'

export const request = createAlova({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
  cacheFor: null,
  statesHook: reactHook,
  requestAdapter: adapterFetch(),
  async responded(response: Response) {
    const status = response.status

    if (status === 401 || status === 403) {
      // localStorage.removeItem('authToken')
      // if (!location.pathname.includes('/login')) {
      //   window.location.replace('/login')
      //   return {}
      // }
      return {}
    }

    // 处理 204 或空响应
    if (status === 204 || response.headers.get('content-length') === '0') {
      return {}
    }

    if (status >= 200 && status < 300) return response.json()

    // 处理其他错误
    const responseText = await response.text()
    let errorMessage = `API request failed with status ${response.status}`

    try {
      const errorData: ErrorResponse = JSON.parse(responseText)
      if (errorData?.message) errorMessage = errorData.message
    } catch {
      console.error('Could not parse API error response body:', responseText)
    }

    throw new Error(errorMessage)
  },
  async beforeRequest(method) {
    const headers = method.config.headers || {}
    const token = localStorage.getItem('authToken')
    if (token) headers['Authorization'] = `Bearer ${token}`
    if (!(method.data instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }
    method.config.headers = headers
  },
})

const FILE_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'video/mp4',
  'text/plain',
  'text/html',
  'application/json',
]
/**
 * 上传文件方法
 * @param file 要上传的文件
 * @returns 上传后的文件URL
 */
export const uploadFile = async (file: File): Promise<string> => {
  // 验证文件类型
  if (!FILE_ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`不支持的文件类型: ${file.name}`)
  }

  const formData = new FormData()
  formData.append('files', file)

  const { urls = [] } = await request.Post<MultiUploadResult>(
    '/generate/attachments',
    formData
  )
  return urls[0] || ''
}
