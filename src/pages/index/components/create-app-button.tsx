import { useSelectApp } from '@/hooks/use-select-app'
import { cn } from '@/lib/utils'
import { PackagePlus } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../components/ui/button'

export const CreateAppButton = memo(({ className }: { className?: string }) => {
  const { t } = useTranslation()
  const handleSelectApp = useSelectApp()

  return (
    <Button
      className={cn('flex-1 w-0 justify-start gap-2 !px-3', className)}
      size="sm"
      onClick={() => handleSelectApp(null)}
    >
      <PackagePlus />
      <span>{t('sidebar.newApp')}</span>
    </Button>
  )
})
