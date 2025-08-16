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
import authController from '@/controllers/auth-controller'
import { useMemoizedFn } from 'ahooks'
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

    const handleOpenProductUrl = useMemoizedFn(async () => {
      if (!productUrl) return
      window.open(productUrl.split('?')[0], '_blank')
    })

    const handleOpenManagementUrl = useMemoizedFn(async () => {
      if (!managementUrl) return
      const code = await authController.generateSsoCode()
      window.open(`${managementUrl}?code=${code}`, '_blank')
    })

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
              onClick={handleOpenProductUrl}
            >
              <span>{t('navbar.visitApp')}</span>
              <SquareArrowOutUpRight className="text-foreground" />
            </DropdownMenuItem>
          )}
          {managementUrl && (
            <DropdownMenuItem
              className="w-full flex justify-between items-center gap-4"
              onClick={handleOpenManagementUrl}
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
