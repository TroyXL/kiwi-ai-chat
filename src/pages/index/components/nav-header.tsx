import { Spinner } from '@/components/spinner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SidebarTrigger } from '@/components/ui/sidebar'
import appListController, {
  useSelectApp,
} from '@/controllers/appListController'
import { cn } from '@/lib/utils'
import { useBoolean, useRequest } from 'ahooks'
import { Trash2 } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const NavHeader = observer(() => {
  const selectedApp = appListController.selectedApp
  const { t } = useTranslation()
  const [
    deleteDialogStatus,
    {
      setTrue: showDeleteDialog,
      setFalse: hideDeleteDialog,
      set: setDeleteDialogStatus,
    },
  ] = useBoolean(false)
  const handleSelectApp = useSelectApp()

  const { loading: deleteLoading, run: handleComfirmDelete } = useRequest(
    async () => {
      if (!selectedApp) return

      try {
        await appListController.removeAppById(selectedApp.id)
        handleSelectApp(null)
      } catch (error) {
        console.error('Failed to delete application:', error)
        toast.error(`Error: ${(error as Error).message}`)
      } finally {
        setDeleteDialogStatus(false)
      }
    },
    {
      manual: true,
    }
  )

  return (
    <>
      <header
        className={cn(
          'h-14 px-4 flex justify-between items-center',
          selectedApp && 'border-b'
        )}
      >
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          {selectedApp && (
            <h2 className="text-base font-medium">{selectedApp.name}</h2>
          )}
        </div>
        {selectedApp && (
          <Button
            variant="ghost"
            size="icon"
            className="!text-red-500"
            onClick={showDeleteDialog}
          >
            <Trash2 />
          </Button>
        )}
      </header>

      {selectedApp && (
        <Dialog open={deleteDialogStatus} onOpenChange={setDeleteDialogStatus}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t('sidebar.deleteTitle', { appName: selectedApp.name })}
              </DialogTitle>
            </DialogHeader>

            <p>
              {t('sidebar.deleteConfirmMessage', {
                appName: selectedApp.name,
              })}
            </p>

            <DialogFooter>
              <Button onClick={hideDeleteDialog}>{t('common.cancel')}</Button>
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
      )}
    </>
  )
})
