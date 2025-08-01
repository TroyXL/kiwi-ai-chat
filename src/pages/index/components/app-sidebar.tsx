import appListController from '@/controllers/app-list-controller'
import authController from '@/controllers/auth-controller'
import { useSelectApp } from '@/hooks/use-select-app'
import { useRequest } from 'ahooks'
import { Archive, LogOut } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
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
} from '../../../components/ui/sidebar'
import { BetaTip } from './beta-tip'
import { CreateAppButton } from './create-app-button'

export const AppSidebar = observer(() => {
  const { t } = useTranslation()
  const { appId } = useParams()
  const handleSelectApp = useSelectApp()

  const { loading } = useRequest(async () => {
    await appListController.fetchAppList()
    if (appId) appListController.selectAppById(appId)
  })
  const applications = appListController.appList
  const hasApplicaitons = applications.length > 0
  const selectedApp = appListController.selectedApp

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center p-2">
          <KiwiLogo />
          <h2 className="text-xl ml-4">Kiwi AI</h2>
          <BetaTip />
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
                    onClick={() => handleSelectApp(app)}
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
          <div className="flex flex-col items-center p-4 mx-2 gap-2 border border-dashed rounded-md text-muted-foreground bg-muted">
            <Archive strokeWidth={1} />
            <p className="text-xs">{t('sidebar.noApps')}</p>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter className="flex flex-row gap-2">
        <Button
          className="w-0 flex-1"
          variant="outline"
          onClick={() => authController.logout()}
        >
          <LogOut />
          {t('sidebar.logout')}
        </Button>
        <LanguageSwitcher simple />
      </SidebarFooter>
    </Sidebar>
  )
})
