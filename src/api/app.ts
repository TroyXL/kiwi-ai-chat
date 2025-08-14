import { request } from '../lib/request'

// 使用 alovajs 创建请求方法
export function searchApplications(params: {
  name?: string
  page?: number
  pageSize?: number
  newlyChangedId?: string
}) {
  return request.Post<SearchResult<Application>>('/app/search', params)
}

export function getApplication(id: string) {
  return request.Get<Application>(`/app/${id}`)
}

export function saveApplication(app: Partial<Application>) {
  return request.Post<string>('/app', app)
}

export function deleteApplication(id: string) {
  return request.Delete<void>(`/app/${id}`)
}
