import exchangeController from '@/controllers/exchange-controller'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { useCreation, useUnmount } from 'ahooks'
import { reaction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useRef } from 'react'

export const AppPreview = observer(({ className }: { className?: string }) => {
  const isMobile = useIsMobile()
  const $iframe = useRef<HTMLIFrameElement>(null)
  const previewUrl = exchangeController.previewUrl

  const disposeReaction = useCreation(
    () =>
      reaction(
        () => [exchangeController.previewUrl],
        ([nextUrl]) => {
          const contentWindow = $iframe.current?.contentWindow
          if (!contentWindow) return

          console.log('reload')
          try {
            contentWindow.location.reload()
          } catch {
            $iframe.current!.setAttribute('src', nextUrl)
          }
        }
      ),
    []
  )

  // useCreation(() => {
  //   const contentWindow = $iframe.current?.contentWindow
  //   if (!contentWindow) {
  //     setPreviewUrl(exchangeController.previewUrl)
  //     return
  //   }
  //   console.log('reloaded')
  //   const params = exchangeController.previewUrl.split('?')[1]
  //   const contentUrl = contentWindow.location.href.split('?')[0]
  //   setPreviewUrl(contentUrl + (contentUrl.includes('?') ? '' : '?') + params)
  // }, [exchangeController.previewUrl])

  // useCreation(() => reaction(() => [exchangeController.previewUrl], ([previewUrl]) => {
  //   if (!url) {
  //     return
  //   }
  //   $iframe.current?.setAttribute('src', url)
  // }))

  useUnmount(() => disposeReaction())

  return isMobile || !previewUrl ? null : (
    <div className={cn('relative', className)}>
      <iframe
        ref={$iframe}
        src={previewUrl}
        className="w-full h-full border-0"
        allowFullScreen
      />
    </div>
  )
})
