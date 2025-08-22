import exchangeController from '@/controllers/exchange-controller'
import { useIsMobile } from '@/hooks/use-mobile'
import hostMessageChannel from '@/lib/kiwi-channel/for-host'
import { cn } from '@/lib/utils'
import { useCreation } from 'ahooks'
import { observer } from 'mobx-react-lite'
import { useRef } from 'react'

export const AppPreview = observer(({ className }: { className?: string }) => {
  const isMobile = useIsMobile()
  const $iframe = useRef<HTMLIFrameElement>(null)
  const productUrl = exchangeController.productUrl

  useCreation(() => {
    if (!$iframe.current?.contentWindow) return
    hostMessageChannel.refreshPreview()
  }, [productUrl])

  return isMobile || !productUrl ? null : (
    <div className={cn('relative', className)}>
      <iframe
        ref={$iframe}
        src={productUrl}
        className="w-full h-full border-0"
        allowFullScreen
      />
    </div>
  )
})
