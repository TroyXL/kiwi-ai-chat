import { Button } from '@/components/ui/button'
import { TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import exchangeController from '@/controllers/exchange-controller'
import { Tooltip } from '@radix-ui/react-tooltip'
import { useMemoizedFn } from 'ahooks'
import { FolderDown } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'

export const DownloadSourceButton = observer(() => {
  {
    const { t } = useTranslation()

    const handleDownload = useMemoizedFn(() => {
      if (exchangeController.sourceCodeUrl)
        window.open(exchangeController.sourceCodeUrl, '_blank')
    })

    if (!exchangeController.sourceCodeUrl) return null

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" onClick={handleDownload}>
            <FolderDown />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('navbar.downloadSource')}</p>
        </TooltipContent>
      </Tooltip>
    )
  }
})
