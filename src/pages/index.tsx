// src/pages/MainPage.tsx
import { ProtectedRoute } from '@/components/protected-route'
import { SidebarProvider } from '@/components/ui/sidebar'
import appListController from '@/controllers/app-list-controller'
import { Observer } from 'mobx-react-lite'
import { memo } from 'react'
import { Outlet } from 'react-router'
import { AppSidebar } from './index/components/app-sidebar'
import { NavHeader } from './index/components/nav-header'

export default memo(() => {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="full-screen flex">
          <AppSidebar />
          <main className="w-0 h-full flex-1 flex flex-col">
            <NavHeader />
            <Observer>
              {() =>
                appListController.initialized ? (
                  <Outlet key={appListController.selectedApp?.id} />
                ) : null
              }
            </Observer>
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
})
