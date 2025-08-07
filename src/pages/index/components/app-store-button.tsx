import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {} from '@radix-ui/react-tooltip'
import { useMemoizedFn } from 'ahooks'
import { Store } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

export const AppStoreButton = memo(
  ({ simple, className }: { simple?: boolean; className?: string }) => {
    const { t } = useTranslation()
    const gotoAppMarket = useMemoizedFn(() => {
      window.open('https://market.metavm.tech/', '_blank')
    })

    if (simple)
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className={className}
              size="icon-sm"
              onClick={gotoAppMarket}
            >
              <Store />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('sidebar.kiwiAppMarket')}</p>
          </TooltipContent>
        </Tooltip>
      )
    return (
      <Button className={className} size="sm" onClick={gotoAppMarket}>
        <Store />
        {t('sidebar.kiwiAppMarket')}
      </Button>
    )
  }
)
