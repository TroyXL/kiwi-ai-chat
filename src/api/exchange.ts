import { API_BASE_URL } from '@/lib/constants'
import { getStorage, removeStorage } from '@/lib/storage'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { request } from '../lib/request'

export function searchExchanges(params: {
  appId: string
  prompt?: string
  page?: number
  pageSize?: number
}) {
  return request.Post<SearchResult<Exchange>>('/generate/history', params)
}

export function cancelGeneration(exchangeId: string) {
  return request.Post<void>('/generate/cancel', { exchangeId })
}

function createEventSource(
  url: string,
  listeners: GenerateCodeListeners,
  signal: AbortSignal,
  options?: { method?: 'GET' | 'POST'; body?: any }
): void {
  const token = getStorage('kiwi:user:token')
  const headers: Record<string, string> = {
    Accept: 'text/event-stream',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (options?.body) {
    headers['Content-Type'] = 'application/json'
  }

  fetchEventSource(url, {
    method: options?.method || 'GET',
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
    signal,
    openWhenHidden: true,

    onopen: async response => {
      // 优先处理认证错误
      if (response.status === 401 || response.status === 403) {
        removeStorage('kiwi:user:token')
        window.location.replace('/login')
        // 抛出错误以确保 fetchEventSource 库停止处理
        throw new Error(`Authentication failed with status ${response.status}`)
      }

      if (!response.ok) {
        // 处理其他非认证服务器错误（例如 500）
        listeners.onError(
          new Error(
            `Failed to connect with status ${response.status}: ${response.statusText}`
          )
        )
        throw new Error(
          `Failed to connect with status ${response.status}: ${response.statusText}`
        )
      }
    },

    onmessage: event => {
      if (event.event !== 'generation' || !event.data) {
        return
      }
      try {
        const exchangeData = JSON.parse(event.data) as Exchange
        console.log("Received 'generation' event with data:", exchangeData)
        listeners.onMessage(exchangeData)
      } catch (e) {
        console.error('Failed to parse SSE message data:', event.data, e)
      }
    },

    onclose: () => {
      listeners.onClose()
    },

    onerror: err => {
      listeners.onError(err)
    },
  })
}

export function generateCode(
  body: {
    prompt: string
    appId?: string
    attachmentUrls?: string[]
    skipPageGeneration?: boolean
  },
  listeners: GenerateCodeListeners,
  signal: AbortSignal
): void {
  createEventSource(`${API_BASE_URL}/generate`, listeners, signal, {
    method: 'POST',
    body,
  })
}

export function reconnectExchange(
  params: { exchangeId: string },
  listeners: GenerateCodeListeners,
  signal: AbortSignal
): void {
  const queryParams = new URLSearchParams()
  queryParams.append('exchange-id', params.exchangeId)

  const url = `${API_BASE_URL}/generate/reconnect?${queryParams.toString()}`
  createEventSource(url, listeners, signal)
}

export function retryGeneration(
  params: { exchangeId: string },
  listeners: GenerateCodeListeners,
  signal: AbortSignal
): void {
  createEventSource(`${API_BASE_URL}/generate/retry`, listeners, signal, {
    method: 'POST',
    body: { exchangeId: params.exchangeId },
  })
}

export function revertGeneration(exchangeId: string) {
  return request.Post<void>(
    '/generate/revert',
    { exchangeId },
    {
      timeout: 30000,
    }
  )
}
