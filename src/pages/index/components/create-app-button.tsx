import { useSidebar } from '@/components/ui/sidebar'
import { useApps } from '@/contexts/AppContext'
import { Plus } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../components/ui/button'

export const CreateAppButton = memo(
  ({
    highlight = true,
    small,
    className,
  }: {
    small?: boolean
    highlight?: boolean
    className?: string
  }) => {
    const { t } = useTranslation()
    const { selectApp } = useApps()
    const { setOpenMobile } = useSidebar()

    return (
      <Button
        className={className}
        variant={highlight ? 'default' : 'secondary'}
        size={small ? 'sm' : void 0}
        onClick={() => {
          setOpenMobile(false)
          selectApp(null)
        }}
      >
        <Plus />
        <span>{t('sidebar.newApp')}</span>
      </Button>
    )
  }
)
