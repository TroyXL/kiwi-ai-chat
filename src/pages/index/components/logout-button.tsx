import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import authController from '@/controllers/auth-controller'
import { LogOut } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

export const LogoutButton = memo(() => {
  const { t } = useTranslation()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="!border-border/80 shadow-md"
          variant="outline"
          size="icon-sm"
          title={t('sidebar.logout')}
        >
          <LogOut />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-auto p-1">
        <Button
          variant="ghost"
          size="sm"
          className="!text-destructive"
          onClick={() => authController.logout()}
        >
          {t('sidebar.logoutTitle')}
        </Button>
      </PopoverContent>
    </Popover>
  )
})
