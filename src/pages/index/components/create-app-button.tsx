import { useSelectApp } from '@/hooks/use-select-app'
import { Plus } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../components/ui/button'

export const CreateAppButton = memo(({ className }: { className?: string }) => {
  const { t } = useTranslation()
  const handleSelectApp = useSelectApp()

  return (
    <Button className={className} onClick={() => handleSelectApp(null)}>
      <Plus />
      <span>{t('sidebar.newApp')}</span>
    </Button>
  )
})
