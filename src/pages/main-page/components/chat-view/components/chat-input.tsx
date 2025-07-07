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
    loading,
    className,
    onSend,
  }: {
    loading: boolean
    className?: string
    onSend: (message: string) => void
  }) => {
    const { t } = useTranslation()
    const { selectedApp } = useApps()
    const $textarea = useRef<HTMLTextAreaElement>(null)

    const handleSendMessage = useMemoizedFn(() => {
      if (!$textarea.current || loading) return
      const message = $textarea.current.value.trim()
      if (!message) return
      $textarea.current.value = ''
      onSend(message)
    })

    useKeyPress(['meta.enter', 'ctrl.enter', 'shift.enter'], () => {
      if (document.activeElement !== $textarea.current) return
      handleSendMessage()
    })

    return (
      <div className={cn('p-4 pt-0', className)}>
        {/* <Sender
        className=""
        
      ></Sender> */}

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
            variant={loading ? 'ghost' : 'default'}
            size="icon"
            className="absolute right-3 bottom-3 size-8"
            disabled={loading}
            onClick={handleSendMessage}
          >
            {loading ? <Spinner /> : <Send />}
          </Button>
        </section>

        <p className="text-muted-foreground text-xs text-center mt-2">
          {t('chat.generationNote')}
        </p>
      </div>
    )
  }
)
