import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import authController from '@/controllers/auth-controller'
import { LogOut } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

export const LogoutButton = memo(() => {
  const { t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="!border-border/80 shadow-md"
          variant="outline"
          size="icon-sm"
          title={t('sidebar.logout')}
        >
          <LogOut />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="!text-destructive"
            onClick={() => authController.logout()}
          >
            {t('sidebar.logoutTitle')}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
