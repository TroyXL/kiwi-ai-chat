import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import appListController from '@/controllers/app-list-controller'
import exchangeController from '@/controllers/exchange-controller'
import { cn } from '@/lib/utils'
import { observer } from 'mobx-react-lite'
import { DeleteAppButton } from './delete-app-button'
import { OpenWebsitesButton } from './open-websites-button'
import { PreviewModeButtons } from './preview-mode-buttons'

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

export const NavHeader = observer(() => {
  const selectedApp = appListController.selectedApp

  return (
    <>
      <header
        className={cn(
          'h-14 px-4 flex justify-between items-center bg-background',
          selectedApp && 'border-b'
        )}
      >
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <AppName app={selectedApp} />
        </div>

        <div className="flex items-center gap-1">
          <PreviewModeButtons />
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
