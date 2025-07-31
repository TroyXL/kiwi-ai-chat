import { deleteApplication, searchApplications } from '@/api/app'
import { useSidebar } from '@/components/ui/sidebar'
import { useMemoizedFn } from 'ahooks'
import { makeAutoObservable, runInAction } from 'mobx'
import { useNavigate } from 'react-router'

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

const appListController = new AppListController()
export default appListController

export function useSelectApp() {
  const navigate = useNavigate()
  const { setOpenMobile } = useSidebar()
  return useMemoizedFn(
    (app: Nilable<Application>, isNewApp: boolean = false) => {
      setOpenMobile(false)
      if (app?.id === appListController.selectedApp?.id) return
      appListController.selectApp(app || null, isNewApp)
      navigate(`/${app?.id || ''}`, {
        replace: true,
      })
    }
  )
}
