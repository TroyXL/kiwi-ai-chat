import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import appListController from '@/controllers/app-list-controller'
import exchangeController from '@/controllers/exchange-controller'
import { useIsMobile } from '@/hooks/use-mobile'
import { useMemoizedFn } from 'ahooks'
import { EyeOff, Monitor, Smartphone } from 'lucide-react'
import { observer } from 'mobx-react-lite'

export const PreviewModeButtons = observer(() => {
  const isMobile = useIsMobile()
  const app = appListController.selectedApp
  const handleModeChange = useMemoizedFn((value: string) => {
    exchangeController.updatePreviewMode(value as PreviewMode)
  })
  if (isMobile || !app || !exchangeController.productUrl) return null

  return (
    <>
      <Tabs
        value={exchangeController.previewMode}
        onValueChange={handleModeChange}
      >
        <TabsList>
          <TabsTrigger value="desktop">
            <Monitor />
          </TabsTrigger>

          <TabsTrigger value="mobile">
            <Smartphone />
          </TabsTrigger>

          <TabsTrigger value="disabled">
            <EyeOff />
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Separator
        orientation="vertical"
        className="ml-1.5 data-[orientation=vertical]:h-4"
      />
    </>
  )
})
