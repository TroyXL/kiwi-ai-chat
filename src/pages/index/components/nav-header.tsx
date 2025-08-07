import { Spinner } from '@/components/spinner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import appListController from '@/controllers/app-list-controller'
import exchangeController from '@/controllers/exchange-controller'
import { useIsMobile } from '@/hooks/use-mobile'
import { useSelectApp } from '@/hooks/use-select-app'
import { cn } from '@/lib/utils'
import { useBoolean, useRequest } from 'ahooks'
import { Eye, EyeOff, SquareArrowOutUpRight, Trash2 } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

type AppProps = {
  app: Nullable<Application>
}

const AppName = ({ app }: AppProps) => {
  return (
    app && (
      <>
        <Separator
          orientation="vertical"
          className="mr-1.5 data-[orientation=vertical]:h-4"
        />
        <h2 className="text-base font-medium">{app.name}</h2>
      </>
    )
  )
}

const DeleteButton = ({ app }: AppProps) => {
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
        if (!app) return
        try {
          await appListController.removeAppById(app.id)
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

    if (!app) return null

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
            <p>{t('exchange.deleteApp')}</p>
          </TooltipContent>
        </Tooltip>

        <Dialog open={deleteDialogStatus} onOpenChange={setDeleteDialogStatus}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t('sidebar.deleteTitle', {
                  appName: app.name,
                })}
              </DialogTitle>
            </DialogHeader>

            <p>
              {t('sidebar.deleteConfirmMessage', {
                appName: app.name,
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
}

const TogglePreviewButton = observer(({ app }: AppProps) => {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  if (isMobile || !app || !exchangeController.previewUrl) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="hover:bg-foreground/5"
          onClick={() => exchangeController.togglePreviewEnabled()}
        >
          {exchangeController.previewEnabled ? <Eye /> : <EyeOff />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{t('exchange.togglePreview')}</p>
      </TooltipContent>
    </Tooltip>
  )
})

const OpenProductButton = observer(() => {
  const { t } = useTranslation()
  if (!exchangeController.previewUrl) return null
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="hover:bg-foreground/5"
          onClick={() => {
            window.open(exchangeController.previewUrl.split('?')[0], '_blank')
          }}
        >
          <SquareArrowOutUpRight />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{t('exchange.visitApp')}</p>
      </TooltipContent>
    </Tooltip>
  )
})

export const NavHeader = observer(() => {
  const selectedApp = appListController.selectedApp

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
          <AppName app={selectedApp} />
        </div>

        <div className="flex gap-1">
          <TogglePreviewButton app={selectedApp} />
          <OpenProductButton />
          <DeleteButton app={selectedApp} />
        </div>
      </header>
    </>
  )
})
