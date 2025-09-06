import { Spinner } from '@/components/spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import appListController from '@/controllers/app-list-controller'
import exchangeController from '@/controllers/exchange-controller'
import uploadController from '@/controllers/upload-controller'
import { cn } from '@/lib/utils'
import { useKeyPress, useMemoizedFn, useRequest } from 'ahooks'
import { Paperclip, Send } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { ChangeEvent, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { AutoCollectButton } from './auto-collect-button'
import { FileList } from './file-list'
import chatController from '@/controllers/chat-controller'

export const ChatInput = observer(({ className }: { className?: string }) => {
  const { t } = useTranslation()
  const $textarea = useRef<HTMLTextAreaElement>(null)
  const disabled =
    exchangeController.isGenerating || exchangeController.isReverting
  const selectedApp = appListController.selectedApp
  const textareaPlaceholder = selectedApp
    ? t('chat.placeholderWithApp', {
        appName: selectedApp.name,
      })
    : t('chat.placeholderNewApp')

  const { loading: uploading, run: handleUploadFiles } = useRequest(
    (files: File[]) => uploadController.uploadFiles(files),
    {
      manual: true,
    }
  )

  // 使用Enter键发送消息
  useKeyPress(['enter'], e => {
    // 如果同时按下了修饰键（meta、ctrl、shift），则不处理Enter事件
    if (e.metaKey || e.ctrlKey || e.shiftKey) return

    if (disabled || document.activeElement !== $textarea.current) return

    // 阻止默认换行行为并发送消息
    e.preventDefault()
    chatController.sendMessage()
  })

  return (
    <div className={cn('pb-4 px-4', className)}>
      <section className="relative max-w-[720px] m-auto flex flex-col gap-2">
        <FileList />
        <Textarea
          ref={$textarea}
          value={chatController.message}
          onChange={e => chatController.setMessage(e.target.value)}
          className="min-h-24 max-h-80 pb-14 resize-none text-sm"
          placeholder={textareaPlaceholder}
        />

        <ChatInputRightActions
          app={selectedApp}
          disabled={disabled}
          uploading={uploading}
          onUploadFiles={handleUploadFiles}
        />
      </section>

      <p className="text-muted-foreground text-xs text-center mt-2">
        {t('chat.generationNote')}
      </p>
    </div>
  )
})

const ChatInputRightActions = ({
  app,
  disabled,
  uploading,
  onUploadFiles,
}: {
  app: Application | null
  disabled: boolean
  uploading: boolean
  onUploadFiles: (files: File[]) => void
}) => {
  const { t } = useTranslation()
  const handleFilesUpload = useMemoizedFn(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files) return
      onUploadFiles(Array.from(files))
    }
  )

  return (
    <div className="absolute right-3 bottom-3 flex gap-2">
      {app && <AutoCollectButton disabled={disabled} appId={app.id} />}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="relative"
            size="icon-xs"
            variant="secondary"
            disabled={disabled || uploading}
          >
            {uploading ? <Spinner /> : <Paperclip />}
            {!disabled && (
              <Input
                className="opacity-0 absolute top-0 bottom-0 left-0 right-0 z-10"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/gif,application/pdf,video/mp4,text/plain,text/html,application/json"
                disabled={disabled || uploading}
                onChange={handleFilesUpload}
              />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{t('chat.fileUploadTooltip')}</p>
        </TooltipContent>
      </Tooltip>

      <Button
        size="icon-xs"
        variant="secondary"
        disabled={disabled || uploading}
        onClick={() => chatController.sendMessage()}
      >
        {disabled ? <Spinner /> : <Send />}
      </Button>
    </div>
  )
}
