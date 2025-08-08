import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AppWindow, SquareArrowOutUpRight } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

export const OpenWebsitesButton = memo(
  ({
    productUrl,
    managementUrl,
    small,
  }: {
    productUrl: Nilable<string>
    managementUrl: Nilable<string>
    small?: boolean
  }) => {
    const { t } = useTranslation()
    if (!productUrl && !managementUrl) return null

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={small ? 'secondary' : 'ghost'}
            size={small ? 'icon-xs' : 'icon-sm'}
            className="hover:bg-foreground/5"
          >
            <AppWindow />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex flex-col p-1 w-auto" align="end">
          {productUrl && (
            <DropdownMenuItem
              className="w-full flex justify-between items-center gap-4"
              onClick={() => {
                window.open(productUrl.split('?')[0], '_blank')
              }}
            >
              <span>{t('exchange.visitApp')}</span>
              <SquareArrowOutUpRight className="text-foreground" />
            </DropdownMenuItem>
          )}
          {managementUrl && (
            <DropdownMenuItem
              className="w-full flex justify-between items-center gap-4"
              onClick={() => {
                window.open(managementUrl, '_blank')
              }}
            >
              <span>{t('exchange.visitManagement')}</span>
              <SquareArrowOutUpRight className="text-foreground" />
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)
