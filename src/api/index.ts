import { createAlova } from 'alova'
import adapterFetch from 'alova/fetch'
import reactHook from 'alova/react'

const alovaInstance = createAlova({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
  cacheFor: null,
  statesHook: reactHook,
  requestAdapter: adapterFetch(),
  responded: async response => {
    const status = response.status

    if (status === 401 || status === 403) {
      localStorage.removeItem('authToken')
      if (!location.pathname.includes('/login')) {
        window.location.replace('/login')
        return
      }
    }

    // 处理 204 或空响应
    if (status === 204 || response.headers.get('content-length') === '0') {
      return null
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
    if (method.data) headers['Content-Type'] = 'application/json'

    const token = localStorage.getItem('authToken')
    if (token) headers['Authorization'] = `Bearer ${token}`

    method.config.headers = headers
  },
})

export default alovaInstance
