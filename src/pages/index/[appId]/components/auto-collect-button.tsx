import { Spinner } from '@/components/spinner'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import uploadController from '@/controllers/upload-controller'
import hostMessageChannel from '@/lib/kiwi-channel/for-host'
import { useRequest } from 'ahooks'
import { FileArchive } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const collectDiag = async (appId: string) => {
        const timestamp = Date.now()
      const files: File[] = []
      let logFile: File | undefined

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
        logFile = new File(
          [JSON.stringify(logsContent, void 0, 2)],
          logsFilename,
          { type: 'text/plain' }
        )
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

      // 上传日志文件
      if (logFile) {
        await uploadController.updateConsoleLog(appId, logFile)
      }

      // 上传其他文件
      await uploadController.uploadFiles(files)
      return uploadController.getSuccessFileUrls()
}

export const AutoCollectButton = memo(({ disabled, appId }: { disabled: boolean, appId: string }) => {
  const { t } = useTranslation()

  const { loading, run: handleAutoFix } = useRequest(
    async () => {
      if (disabled) return
      const supported = await hostMessageChannel.getChannelSupported()
      if (!supported) return toast.error(t('exchange.channelNotSupported'))
      await collectDiag(appId)
    },
    {
      manual: true,
    }
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="secondary"
          size="icon-xs"
          disabled={loading || disabled}
          onClick={handleAutoFix}
        >
          {loading ? <Spinner /> : <FileArchive />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{t('exchange.collectPageDataTooltip')}</p>
      </TooltipContent>
    </Tooltip>
  )
})
