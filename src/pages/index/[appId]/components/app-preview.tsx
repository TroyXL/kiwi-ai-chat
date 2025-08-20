import exchangeController from '@/controllers/exchange-controller'
import { useIsMobile } from '@/hooks/use-mobile'
import hostMessageChannel from '@/lib/kiwi-channel/for-host'
import { cn } from '@/lib/utils'
import { useCreation, useUnmount } from 'ahooks'
import { reaction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useRef } from 'react'

export const AppPreview = observer(({ className }: { className?: string }) => {
  const isMobile = useIsMobile()
  const $iframe = useRef<HTMLIFrameElement>(null)
  const productUrl = exchangeController.productUrl

  const disposeReaction = useCreation(
    () =>
      reaction(
        () => [exchangeController.productUrl],
        () => {
          console.log('reload')
          hostMessageChannel.refreshPreview()
        }
      ),
    []
  )

  // useCreation(() => {
  //   const contentWindow = $iframe.current?.contentWindow
  //   if (!contentWindow) {
  //     setPreviewUrl(exchangeController.productUrl)
  //     return
  //   }
  //   console.log('reloaded')
  //   const params = exchangeController.productUrl.split('?')[1]
  //   const contentUrl = contentWindow.location.href.split('?')[0]
  //   setPreviewUrl(contentUrl + (contentUrl.includes('?') ? '' : '?') + params)
  // }, [exchangeController.productUrl])

  // useCreation(() => reaction(() => [exchangeController.productUrl], ([productUrl]) => {
  //   if (!url) {
  //     return
  //   }
  //   $iframe.current?.setAttribute('src', url)
  // }))

  useUnmount(() => disposeReaction())

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
