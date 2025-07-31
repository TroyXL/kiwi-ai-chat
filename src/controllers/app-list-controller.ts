import { deleteApplication, searchApplications } from '@/api/app'
import { navigate } from '@/lib/utils'
import { makeAutoObservable, runInAction } from 'mobx'

class AppListController {
  appList: Application[] = []
  selectedApp: Nullable<Application> = null

  constructor() {
    makeAutoObservable(this)
    this.fetchAppList()
  }

  async fetchAppList(newlyChangedId?: string) {
    try {
      const pageData = await searchApplications({
        page: 1,
        pageSize: 100,
        newlyChangedId,
      })
      runInAction(() => (this.appList = pageData.items))
    } catch (error) {
      runInAction(() => (this.appList = []))
      console.error('Failed to fetch applications:', error)
    }
    return this.appList
  }

  selectApp(app: Nullable<Application>, isNewApp = false) {
    this.selectedApp = app
    if (isNewApp && app) {
      sessionStorage.setItem('newAppId', app.id)
    } else {
      sessionStorage.removeItem('newAppId')
    }
    navigate.replace(`/${app?.id || ''}`)
  }

  selectAppById(appId: string) {
    const app = this.appList.find(app => app.id === appId)
    if (app) {
      this.selectApp(app)
    }
  }

  addApp(app: Application) {
    this.appList = [app, ...this.appList]
  }
  updateApp(app: Application) {
    this.appList = this.appList.map(appItem =>
      appItem.id === app.id ? app : appItem
    )
  }
  async removeAppById(appId: string) {
    await deleteApplication(appId)
    runInAction(
      () => (this.appList = this.appList.filter(app => app.id !== appId))
    )
  }
}

export default new AppListController()
