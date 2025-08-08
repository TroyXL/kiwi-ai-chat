import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import appListController from '@/controllers/app-list-controller'
import exchangeController from '@/controllers/exchange-controller'
import { useIsMobile } from '@/hooks/use-mobile'
import { useMemoizedFn } from 'ahooks'
import { EyeOff, Monitor, Smartphone } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'

export const PreviewModeButtons = observer(() => {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const app = appListController.selectedApp
  const handleModeChange = useMemoizedFn((value: string) => {
    exchangeController.previewMode = value as PreviewMode
  })
  if (isMobile || !app || !exchangeController.productUrl) return null

  return (
    <>
      <Tabs
        value={exchangeController.previewMode}
        onValueChange={handleModeChange}
      >
        <TabsList>
          <Tooltip>
            <TooltipTrigger>
              <TabsTrigger value="desktop">
                <Monitor />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent>{t('navbar.previewAsDesktop')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <TabsTrigger value="mobile">
                <Smartphone />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent>{t('navbar.previewAsMobile')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <TabsTrigger value="disabled">
                <EyeOff />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent>{t('navbar.disabledPreview')}</TooltipContent>
          </Tooltip>
        </TabsList>
      </Tabs>
      <Separator
        orientation="vertical"
        className="ml-1.5 data-[orientation=vertical]:h-4"
      />
    </>
  )
})
