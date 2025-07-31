import { makeAutoObservable, runInAction } from 'mobx'
import * as authApi from '../api/auth'

class AuthController {
  isAuthenticated: boolean = !!localStorage.getItem('authToken')

  constructor() {
    makeAutoObservable(this)
  }

  async login(userName: string, password: string) {
    await authApi.login(userName, password)
    runInAction(() => (this.isAuthenticated = true))
  }

  async register(userName: string, password: string) {
    await authApi.register(userName, password)
    await this.login(userName, password)
  }

  async logout() {
    await authApi.logout()
    runInAction(() => (this.isAuthenticated = false))
  }
}

export default new AuthController()
