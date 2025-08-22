import { Spinner } from '@/components/spinner'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import exchangeController from '@/controllers/exchange-controller'
import uploadController from '@/controllers/upload-controller'
import { useIsMobile } from '@/hooks/use-mobile'
import hostMessageChannel from '@/lib/kiwi-channel/for-host'
import { cn } from '@/lib/utils'
import { useCreation, useRequest } from 'ahooks'
import { FileArchive } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { memo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

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

      <AutoCollectButton />
    </div>
  )
})

const AutoCollectButton = memo(() => {
  const { t } = useTranslation()

  const { loading: autoFixing, run: handleAutoFix } = useRequest(
    async () => {
      const supported = await hostMessageChannel.getChannelSupported()
      if (!supported) return toast.error(t('exchange.channelNotSupported'))

      uploadController.reset()
      const timestamp = Date.now()
      const files: File[] = []

      const domContent = await hostMessageChannel.getDOMContent()
      // 创建文件名
      const filename = `index-${timestamp}.html`
      // 创建 Blob 对象
      const htmlFile = new File([domContent], filename, { type: 'text/html' })
      files.push(htmlFile)

      // 获取日志内容
      const logsContent = await hostMessageChannel.getLogsContent()
      if (logsContent.length) {
        // 创建日志文件名
        const logsFilename = `logs-${timestamp}.json`
        // 创建日志 Blob 对象
        const logsFile = new File(
          [JSON.stringify(logsContent, void 0, 2)],
          logsFilename,
          { type: 'text/plain' }
        )
        files.push(logsFile)
      }

      const screenshotData = await hostMessageChannel.getScreenshot()
      if (screenshotData?.buffer) {
        // 创建截图文件名
        const screenshotFilename = `screenshot-${timestamp}.png`
        // 创建截图 Blob 对象
        const screenshotFile = new File(
          [screenshotData.buffer],
          screenshotFilename,
          {
            type: screenshotData.type,
          }
        )
        files.push(screenshotFile)
      }

      // 上传文件
      await uploadController.uploadFiles(files)
    },
    {
      manual: true,
    }
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className="absolute bottom-2 right-2 rounded-full border-foreground bg-background shadow-xl"
          size="xs"
          variant="outline"
          disabled={autoFixing}
          onClick={handleAutoFix}
        >
          {autoFixing ? <Spinner /> : <FileArchive />}
          {t('exchange.autoFix')}
        </Button>
      </TooltipTrigger>

      <TooltipContent>
        <p>{t('exchange.autoFixTooltip')}</p>
      </TooltipContent>
    </Tooltip>
  )
})
