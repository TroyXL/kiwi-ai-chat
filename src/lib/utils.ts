import { clsx, type ClassValue } from 'clsx'
import { createBrowserHistory } from 'history'
import { twMerge } from 'tailwind-merge'

export const navigate = createBrowserHistory()

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(() => resolve(void 0), ms))
}

export function nextTick() {
  return new Promise(resolve => {
    requestAnimationFrame(resolve)
  })
}
