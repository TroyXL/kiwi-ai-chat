// src/pages/MainPage.tsx
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppProvider } from '../../contexts/AppContext'
import { AppSidebar } from './components/app-sidebar'
import { ChatView } from './components/chat-view'

export const MainPage = () => {
  return (
    <SidebarProvider>
      <AppProvider>
        <div className="full-screen flex">
          <AppSidebar />
          <ChatView />
        </div>
      </AppProvider>
    </SidebarProvider>
  )
}
