import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useMemoizedFn, useRequest } from 'ahooks'
import { Archive, LogOut, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import * as appApi from '../../../api/app'
import { Application } from '../../../api/types'
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
import { useApps } from '../../../contexts/AppContext'
import { useAuth } from '../../../contexts/AuthContext'
import { CreateAppButton } from './create-app-button'

export const AppSidebar = () => {
  const { t } = useTranslation()
  const { applications, selectedApp, selectApp, removeApplication, loading } =
    useApps()
  const { logout } = useAuth()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const appToDelete = useRef<Application | null>(null)
  const hasApplicaitons = applications.length > 0

  const handleDeleteApp = useMemoizedFn((app: Application) => {
    appToDelete.current = app
    setShowDeleteDialog(true)
  })

  const { loading: deleteLoading, run: handleComfirmDelete } = useRequest(
    async () => {
      if (!appToDelete.current) return

      try {
        await appApi.deleteApplication(appToDelete.current.id)
        removeApplication(appToDelete.current.id)
        selectApp(null)
      } catch (error) {
        console.error('Failed to delete application:', error)
        toast.error(`Error: ${(error as Error).message}`)
      } finally {
        setShowDeleteDialog(false)
        appToDelete.current = null
      }
    },
    {
      manual: true,
    }
  )

  return (
    <>
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
            <Spinner />
          ) : hasApplicaitons ? (
            <>
              <SidebarGroupLabel>{t('sidebar.applications')}</SidebarGroupLabel>
              <SidebarMenu className="space-y-px">
                {applications.map(app => {
                  const selected = selectedApp?.id === app.id

                  return (
                    <SidebarMenuItem
                      key={app.id}
                      onClick={() => selectApp(app)}
                    >
                      <SidebarMenuButton
                        className="flex justify-between"
                        isActive={selected}
                      >
                        <span>{app.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'size-8 -mr-2',
                            selected ? void 0 : 'hidden'
                          )}
                          onClickCapture={() => handleDeleteApp(app)}
                        >
                          <Trash2 />
                        </Button>
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

      <Dialog
        open={showDeleteDialog}
        onOpenChange={open => setShowDeleteDialog(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('sidebar.deleteTitle', { appName: appToDelete.current?.name })}
            </DialogTitle>
          </DialogHeader>

          <p>
            {t('sidebar.deleteConfirmMessage', {
              appName: appToDelete.current?.name,
            })}
          </p>

          <DialogFooter>
            <Button onClick={() => setShowDeleteDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleComfirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading && <Spinner />}
              {t('sidebar.deleteConfirmButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
