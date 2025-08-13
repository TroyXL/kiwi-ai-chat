import alovaInstance from '.'

// 使用 alovajs 创建请求方法
export function searchApplications(params: {
  name?: string
  page?: number
  pageSize?: number
  newlyChangedId?: string
}) {
  return alovaInstance.Post<SearchResult<Application>>('/app/search', params)
}

export function getApplication(id: string) {
  return alovaInstance.Get<Application>(`/app/${id}`)
}

export function saveApplication(app: Partial<Application>) {
  return alovaInstance.Post<string>('/app', app)
}

export function deleteApplication(id: string) {
  return alovaInstance.Delete<void>(`/app/${id}`)
}
