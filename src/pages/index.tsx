// src/pages/MainPage.tsx
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { SidebarProvider } from '@/components/ui/sidebar'
import { memo } from 'react'
import { Outlet } from 'react-router'
import { AppProvider } from '../contexts/AppContext'
import { AppSidebar } from './index/components/app-sidebar'
import { NavHeader } from './index/components/nav-header'

export default memo(() => {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppProvider>
          <div className="full-screen flex">
            <AppSidebar />
            <main className="w-0 h-full flex-1 flex flex-col">
              <NavHeader />
              <Outlet />
            </main>
          </div>
        </AppProvider>
      </SidebarProvider>
    </ProtectedRoute>
  )
})
