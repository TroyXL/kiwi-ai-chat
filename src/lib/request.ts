import i18n from '@/i18n'
import { createAlova } from 'alova'
import adapterFetch from 'alova/fetch'
import reactHook from 'alova/react'
import { toast } from 'sonner'
import { API_BASE_URL } from './constants'
import { getStorage, removeStorage } from './storage'

export const request = createAlova({
  baseURL: API_BASE_URL,
  timeout: 10000,
  cacheFor: null,
  statesHook: reactHook,
  requestAdapter: adapterFetch(),
  responded: {
    async onSuccess(response: Response) {
      const status = response.status

      if (status === 401 || status === 403) {
        removeStorage('kiwi:user:token')
        if (!location.pathname.includes('/login')) {
          window.location.replace('/login')
        }
        throw new Error('Unauthorized ' + status)
      }

      // 处理 204 或空响应
      if (status === 204 || response.headers.get('content-length') === '0') {
        return {}
      }

      const responseText = await response.text()
      let responseData: any = responseText
      try {
        responseData = JSON.parse(responseText)
      } catch {
        //
      }

      if (status >= 200 && status < 300) return responseData

      // 处理其他错误
      let errorMessage = `API request failed with status ${response.status}`

      if (responseData?.message) errorMessage = responseData.message
      else
        console.error('Could not parse API error response body:', responseData)

      throw new Error(errorMessage)
    },
    onError(error, instance) {
      console.error('API request failed:', error)
      if (error.message.includes('timeout')) {
        toast.error(i18n.t('request.networkTimeout'), {
          description: i18n.t('request.urlInfo', { url: instance.url }),
        })
      } else {
        toast.error(i18n.t('request.networkError'), {
          description: i18n.t('request.urlInfo', { url: instance.url }),
        })
      }
    },
  },
  async beforeRequest(method) {
    const headers = method.config.headers || {}
    const token = getStorage('kiwi:user:token')
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
