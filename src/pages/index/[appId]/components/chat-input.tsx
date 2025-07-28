import { Spinner } from '@/components/spinner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useApps } from '@/contexts/AppContext'
import { cn } from '@/lib/utils'
import { useKeyPress, useMemoizedFn } from 'ahooks'
import { Send } from 'lucide-react'
import { memo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

export const ChatInput = memo(
  ({
    generating,
    className,
    onSend,
  }: {
    generating: boolean
    className?: string
    onSend: (message: string) => void
  }) => {
    const { t } = useTranslation()
    const { selectedApp } = useApps()
    const $textarea = useRef<HTMLTextAreaElement>(null)

    const handleSendMessageOrCancelGenerate = useMemoizedFn(() => {
      if (!$textarea.current || generating) return
      const message = $textarea.current.value.trim()
      if (!message) return
      $textarea.current.value = ''
      onSend(message)
    })

    // 使用meta.enter, ctrl.enter, shift.enter在光标位置插入换行
    useKeyPress(['meta.enter', 'ctrl.enter', 'shift.enter'], () => {
      if (!$textarea.current || document.activeElement !== $textarea.current)
        return

      const textarea = $textarea.current
      const { selectionStart, selectionEnd, value } = textarea

      // 在光标位置插入换行符
      const newValue =
        value.substring(0, selectionStart) +
        '\n' +
        value.substring(selectionEnd)
      textarea.value = newValue

      // 将光标位置设置到插入的换行符之后
      const newCursorPosition = selectionStart + 1
      textarea.setSelectionRange(newCursorPosition, newCursorPosition)
    })

    // 使用Enter键发送消息
    useKeyPress(['enter'], e => {
      // 如果同时按下了修饰键（meta、ctrl、shift），则不处理Enter事件
      if (e.metaKey || e.ctrlKey || e.shiftKey) return

      if (generating || document.activeElement !== $textarea.current) return

      // 阻止默认换行行为并发送消息
      e.preventDefault()
      handleSendMessageOrCancelGenerate()
    })

    return (
      <div className={cn('pb-4 px-4', className)}>
        <section className="relative max-w-[720px] m-auto">
          <Textarea
            ref={$textarea}
            className="h-24 pb-14 resize-none"
            placeholder={
              selectedApp
                ? t('chat.placeholderWithApp', { appName: selectedApp.name })
                : t('chat.placeholderNewApp')
            }
          />

          <Button
            size="icon"
            className="absolute right-3 bottom-3 size-8"
            disabled={generating}
            onClick={handleSendMessageOrCancelGenerate}
          >
            {generating ? <Spinner /> : <Send />}
          </Button>
        </section>

        <p className="text-muted-foreground text-xs text-center mt-2">
          {t('chat.generationNote')}
        </p>
      </div>
    )
  }
)
