import { deleteApplication } from '@/api/app'
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
import { useApps } from '@/contexts/AppContext'
import { useBoolean, useRequest } from 'ahooks'
import { Trash2 } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const NavHeader = memo(() => {
  const { t } = useTranslation()
  const { selectedApp, selectApp, removeApplication } = useApps()
  const [
    deleteDialogStatus,
    {
      setTrue: showDeleteDialog,
      setFalse: hideDeleteDialog,
      set: setDeleteDialogStatus,
    },
  ] = useBoolean(false)

  const { loading: deleteLoading, run: handleComfirmDelete } = useRequest(
    async () => {
      if (!selectedApp) return

      try {
        await deleteApplication(selectedApp.id)
        removeApplication(selectedApp.id)
        selectApp(null)
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

  if (!selectedApp) return null
  return (
    <>
      <header className="h-14 px-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h2 className="text-base font-medium">{selectedApp.name}</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="!text-red-500"
          onClick={showDeleteDialog}
        >
          <Trash2 />
        </Button>
      </header>

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
    </>
  )
})
