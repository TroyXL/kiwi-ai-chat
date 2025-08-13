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
import { FileList } from './file-list'

export const ChatInput = observer(({ className }: { className?: string }) => {
  const { t } = useTranslation()
  const $textarea = useRef<HTMLTextAreaElement>(null)
  const disabled =
    exchangeController.isGenerating || exchangeController.isReverting

  const textareaPlaceholder = appListController.selectedApp
    ? t('chat.placeholderWithApp', {
        appName: appListController.selectedApp.name,
      })
    : t('chat.placeholderNewApp')

  const { loading: uploading, run: handleUploadFiles } = useRequest(
    (files: File[]) => uploadController.uploadFiles(files),
    {
      manual: true,
    }
  )

  const handleSendMessage = useMemoizedFn(() => {
    if (!$textarea.current || disabled) return
    const message = $textarea.current.value.trim()
    if (!message) return
    $textarea.current.value = ''
    exchangeController.sendMessageToAI(message)
  })

  // 使用meta.enter, ctrl.enter, shift.enter在光标位置插入换行
  useKeyPress(['meta.enter', 'ctrl.enter', 'shift.enter'], () => {
    if (!$textarea.current || document.activeElement !== $textarea.current)
      return

    const textarea = $textarea.current
    const { selectionStart, selectionEnd, value } = textarea

    // 在光标位置插入换行符
    const newValue =
      value.substring(0, selectionStart) + '\n' + value.substring(selectionEnd)
    textarea.value = newValue

    // 将光标位置设置到插入的换行符之后
    const newCursorPosition = selectionStart + 1
    textarea.setSelectionRange(newCursorPosition, newCursorPosition)
  })

  // 使用Enter键发送消息
  useKeyPress(['enter'], e => {
    // 如果同时按下了修饰键（meta、ctrl、shift），则不处理Enter事件
    if (e.metaKey || e.ctrlKey || e.shiftKey) return

    if (disabled || document.activeElement !== $textarea.current) return

    // 阻止默认换行行为并发送消息
    e.preventDefault()
    handleSendMessage()
  })

  return (
    <div className={cn('pb-4 px-4', className)}>
      <section className="relative max-w-[720px] m-auto flex flex-col gap-2">
        <FileList />
        <Textarea
          ref={$textarea}
          className="min-h-24 max-h-80 pb-14 resize-none text-sm"
          placeholder={textareaPlaceholder}
        />

        <ChatInputActions
          disabled={disabled}
          uploading={uploading}
          onUploadFiles={handleUploadFiles}
          onSendMessage={handleSendMessage}
        />
      </section>

      <p className="text-muted-foreground text-xs text-center mt-2">
        {t('chat.generationNote')}
      </p>
    </div>
  )
})

const ChatInputActions = ({
  disabled,
  uploading,
  onUploadFiles,
  onSendMessage,
}: {
  disabled: boolean
  uploading: boolean
  onUploadFiles: (files: File[]) => void
  onSendMessage: () => void
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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="relative"
            size="icon-sm"
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
        size="icon-sm"
        variant="secondary"
        disabled={disabled || uploading}
        onClick={onSendMessage}
      >
        {disabled ? <Spinner /> : <Send />}
      </Button>
    </div>
  )
}
