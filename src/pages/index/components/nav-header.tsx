import { Button } from '@/components/ui/button'
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
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { DeleteAppButton } from './delete-app-button'
import { OpenWebsitesButton } from './open-websites-button'

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

const TogglePreviewButton = observer(({ app }: AppProps) => {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  if (isMobile || !app || !exchangeController.productUrl) return null

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
          <OpenWebsitesButton
            productUrl={exchangeController.productUrl}
            managementUrl={exchangeController.managementUrl}
          />
          <DeleteAppButton />
        </div>
      </header>
    </>
  )
})
