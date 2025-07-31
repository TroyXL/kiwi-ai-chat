import { useSidebar } from '@/components/ui/sidebar'
import appListController from '@/controllers/app-list-controller'
import { useMemoizedFn } from 'ahooks'

export function useSelectApp() {
  const { setOpenMobile } = useSidebar()
  return useMemoizedFn(
    (app: Nilable<Application>, isNewApp: boolean = false) => {
      setOpenMobile(false)
      if (app?.id === appListController.selectedApp?.id) return
      appListController.selectApp(app || null, isNewApp)
    }
  )
}
