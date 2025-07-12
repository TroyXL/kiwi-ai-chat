import { Archive, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { KiwiLogo } from '../../../components/kiwi-logo'
import { LanguageSwitcher } from '../../../components/language-switcher'
import { Spinner } from '../../../components/spinner'
import { Button } from '../../../components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../../../components/ui/sidebar'
import { useApps } from '../../../contexts/AppContext'
import { useAuth } from '../../../contexts/AuthContext'
import { CreateAppButton } from './create-app-button'

export const AppSidebar = () => {
  const { t } = useTranslation()
  const { applications, selectedApp, selectApp, loading } = useApps()
  const { logout } = useAuth()
  const { setOpenMobile } = useSidebar()

  const hasApplicaitons = applications.length > 0

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-4 p-2">
          <KiwiLogo />
          <h2 className="text-xl">Kiwi AI</h2>
        </div>
        {hasApplicaitons && <CreateAppButton />}
      </SidebarHeader>
      <SidebarContent className="p-2">
        {loading ? (
          <Spinner className="m-auto" />
        ) : hasApplicaitons ? (
          <>
            <SidebarGroupLabel>{t('sidebar.applications')}</SidebarGroupLabel>
            <SidebarMenu className="space-y-px">
              {applications.map(app => {
                const selected = selectedApp?.id === app.id

                return (
                  <SidebarMenuItem
                    key={app.id}
                    onClick={() => {
                      selectApp(app)
                      setOpenMobile(false)
                    }}
                  >
                    <SidebarMenuButton
                      className="flex justify-between"
                      isActive={selected}
                    >
                      {app.name}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </>
        ) : (
          <div className="flex flex-col items-center p-4 gap-2 border border-dashed rounded-md text-muted-foreground">
            <Archive strokeWidth={1} />
            <p className="text-xs">{t('sidebar.noApps')}</p>
            <CreateAppButton className="mt-4" small highlight={false} />
          </div>
        )}
      </SidebarContent>
      <SidebarFooter className="flex flex-row gap-2">
        <Button className="w-0 flex-1" variant="outline" onClick={logout}>
          <LogOut />
          {t('sidebar.logout')}
        </Button>
        <LanguageSwitcher simple />
      </SidebarFooter>
    </Sidebar>
  )
}
