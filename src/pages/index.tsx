// src/pages/MainPage.tsx
import { ProtectedRoute } from '@/components/protected-route'
import { SidebarProvider } from '@/components/ui/sidebar'
import appListController from '@/controllers/app-list-controller'
import { getStorage, setStorage } from '@/lib/storage'
import { useCreation, useMemoizedFn } from 'ahooks'
import { isNil } from 'lodash'
import { Observer } from 'mobx-react-lite'
import { memo } from 'react'
import { Outlet } from 'react-router'
import { AppSidebar } from './index/components/app-sidebar'
import { NavHeader } from './index/components/nav-header'

export default memo(() => {
  const sidebarOpened = useCreation(() => {
    const opened = getStorage('kiwi:ui:sidebar-opened')
    return isNil(opened) ? true : opened
  }, [])

  const onSidebarOpenChange = useMemoizedFn((opened: boolean) => {
    setStorage('kiwi:ui:sidebar-opened', opened)
  })

  return (
    <ProtectedRoute>
      <SidebarProvider
        defaultOpen={sidebarOpened}
        onOpenChange={onSidebarOpenChange}
      >
        <div className="full-screen flex bg-sidebar">
          <AppSidebar />
          <main className="w-0 flex-1 md:p-2">
            <div className="w-full h-full flex flex-col md:border md:rounded-lg md:shadow-md overflow-hidden bg-muted">
              <NavHeader />
              <Observer>
                {() =>
                  appListController.initialized ? (
                    <Outlet key={appListController.selectedApp?.id} />
                  ) : null
                }
              </Observer>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
})
