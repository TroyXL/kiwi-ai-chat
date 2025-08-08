import { Spinner } from '@/components/spinner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import appListController from '@/controllers/app-list-controller'
import { useSelectApp } from '@/hooks/use-select-app'
import { useBoolean, useRequest } from 'ahooks'
import { Trash2 } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const DeleteAppButton = observer(() => {
  {
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
        if (!appListController.selectedApp) return
        try {
          await appListController.removeAppById(
            appListController.selectedApp.id
          )
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

    if (!appListController.selectedApp) return null

    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="!text-red-500 hover:bg-red-500/10"
              onClick={showDeleteDialog}
            >
              <Trash2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('navbar.deleteApp')}</p>
          </TooltipContent>
        </Tooltip>

        <Dialog open={deleteDialogStatus} onOpenChange={setDeleteDialogStatus}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t('sidebar.deleteTitle', {
                  appName: appListController.selectedApp.name,
                })}
              </DialogTitle>
            </DialogHeader>

            <p>
              {t('sidebar.deleteConfirmMessage', {
                appName: appListController.selectedApp.name,
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
                {t('sidebar.delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }
})
