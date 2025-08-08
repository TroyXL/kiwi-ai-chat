import { Spinner } from '@/components/spinner'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import appListController from '@/controllers/app-list-controller'
import { useSelectApp } from '@/hooks/use-select-app'
import { Tooltip } from '@radix-ui/react-tooltip'
import { useRequest } from 'ahooks'
import { Trash2 } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const DeleteAppButton = observer(() => {
  {
    const { t } = useTranslation()
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
        }
      },
      {
        manual: true,
      }
    )

    if (!appListController.selectedApp) return null

    return (
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="!text-red-500 hover:bg-red-500/10"
              >
                <Trash2 />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('navbar.deleteApp')}</p>
          </TooltipContent>
        </Tooltip>

        <PopoverContent className="w-[320px]" align="end">
          <p className="text-lg font-bold">
            {t('sidebar.deleteTitle', {
              appName: appListController.selectedApp.name,
            })}
          </p>
          <p className="my-2">
            {t('sidebar.deleteConfirmMessage', {
              appName: appListController.selectedApp.name,
            })}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={handleComfirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading && <Spinner />}
              {t('common.delete')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }
})
