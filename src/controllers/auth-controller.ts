import { makeAutoObservable, runInAction } from 'mobx'
import * as authApi from '../api/auth'
import appListController from './app-list-controller'
import exchangeController from './exchange-controller'

class AuthController {
  isAuthenticated: boolean = !!localStorage.getItem('authToken')

  constructor() {
    makeAutoObservable(this)
  }

  async login(userName: string, password: string) {
    await authApi.login(userName, password)
    // 获取重定向URL参数
    const params = new URLSearchParams(window.location.search)
    const redirectUrl = params.get('redirectUrl')
    if (!redirectUrl) {
      runInAction(() => (this.isAuthenticated = true))
      return
    }

    const code = await this.generateSsoCode()
    const url = new URL(redirectUrl)
    url.searchParams.set('code', code)
    window.location.href = url.toString()
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
