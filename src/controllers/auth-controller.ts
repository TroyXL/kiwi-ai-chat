import { getStorage } from '@/lib/storage'
import { getQueryParam } from '@/lib/utils'
import { makeAutoObservable, runInAction } from 'mobx'
import * as authApi from '../api/auth'
import appListController from './app-list-controller'
import exchangeController from './exchange-controller'

class AuthController {
  isAuthenticated: boolean = !!getStorage('kiwi:user:token')

  constructor() {
    makeAutoObservable(this)
  }

  async checkRedirectUrl() {
    const redirectUrl = getQueryParam('redirectUrl')
    if (!redirectUrl) return false

    const code = await this.generateSsoCode()
    const url = new URL(redirectUrl)
    url.searchParams.set('code', code)
    window.location.href = url.toString()
    return true
  }

  async login(userName: string, password: string) {
    await authApi.login(userName, password)
    const isRedirected = await this.checkRedirectUrl()
    if (!isRedirected) {
      runInAction(() => (this.isAuthenticated = true))
    }
  }

  async register(userName: string, password: string) {
    await authApi.register(userName, password)
    await this.login(userName, password)
  }

  async logout() {
    await authApi.logout()
    appListController.reset()
    exchangeController.reset()
    runInAction(() => (this.isAuthenticated = false))
  }

  generateSsoCode() {
    return authApi.generateSsoCode()
  }
}

export default new AuthController()
