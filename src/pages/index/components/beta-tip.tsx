import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getStorage, setStorage } from '@/lib/storage'
import { DialogClose } from '@radix-ui/react-dialog'
import { isNil } from 'lodash'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const BetaTip = memo(() => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // 检查是否已经显示过弹窗
    const hasShown = getStorage('kiwi:ui:beta-tip-shown')
    if (isNil(hasShown)) {
      setOpen(true)
      // 标记已显示
      setStorage('kiwi:ui:beta-tip-shown', true)
    }
  }, [])

  const handleClick = () => {
    setOpen(true)
  }

  return (
    <>
      <span
        className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-xs scale-75 mb-4 cursor-pointer"
        onClick={handleClick}
      >
        BETA
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('betaTip.title')}</DialogTitle>
            <DialogDescription>{t('betaTip.description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="w-full">{t('betaTip.startTrial')}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
})
