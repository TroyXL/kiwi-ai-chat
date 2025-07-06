// src/pages/MainPage.tsx
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppProvider } from '../../contexts/AppContext'
import { AppSidebar } from './components/app-sidebar'
import { ChatView } from './components/chat-view'
import { NavHeader } from './components/nav-header'

export const MainPage = () => {
  return (
    <SidebarProvider>
      <AppProvider>
        <div className="full-screen flex">
          <AppSidebar />
          <main className="w-0 h-full flex-1 flex flex-col">
            <NavHeader />
            <ChatView />
          </main>
        </div>
      </AppProvider>
    </SidebarProvider>
  )
}
