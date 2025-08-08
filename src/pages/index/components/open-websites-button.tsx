import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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

    const $dropdownTrigger = (
      <DropdownMenuTrigger asChild>
        <Button
          variant={small ? 'secondary' : 'ghost'}
          size={small ? 'icon-xs' : 'icon'}
          className="hover:bg-foreground/5"
        >
          <AppWindow />
        </Button>
      </DropdownMenuTrigger>
    )

    return (
      <DropdownMenu>
        {small ? (
          $dropdownTrigger
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>{$dropdownTrigger}</TooltipTrigger>
            <TooltipContent>
              <p>{t('navbar.visitWebsites')}</p>
            </TooltipContent>
          </Tooltip>
        )}
        <DropdownMenuContent className="flex flex-col p-1 w-auto" align="end">
          {productUrl && (
            <DropdownMenuItem
              className="w-full flex justify-between items-center gap-4"
              onClick={() => {
                window.open(productUrl.split('?')[0], '_blank')
              }}
            >
              <span>{t('navbar.visitApp')}</span>
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
              <span>{t('navbar.visitManagement')}</span>
              <SquareArrowOutUpRight className="text-foreground" />
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)
