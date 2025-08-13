import { isString, isUndefined } from 'lodash'

export type StorageKey = {
  'kiwi:ui:theme': Theme
  'kiwi:ui:sidebar-opened': boolean
  'kiwi:ui:beta-tip-shown': boolean
  'kiwi:ui:preview-mode': PreviewMode
}

export type StorageKeyType = keyof StorageKey

export function getStorage<K extends StorageKeyType>(
  key: K
): StorageKey[K] | undefined {
  const data = localStorage.getItem(key)
  if (!data) return
  try {
    return JSON.parse(data) as StorageKey[K]
  } catch {
    return data as unknown as StorageKey[K]
  }
}

export function setStorage<K extends StorageKeyType>(
  key: K,
  value: StorageKey[K]
) {
  if (isUndefined(value)) removeStorage(key)
  else if (isString(value)) localStorage.setItem(key, value)
  else localStorage.setItem(key, JSON.stringify(value))
}

export function removeStorage<K extends StorageKeyType>(key: K) {
  localStorage.removeItem(key)
}
