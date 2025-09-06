import { KiwiLogo } from '@/components/kiwi-logo'
import appListController from '@/controllers/app-list-controller'
import exchangeController from '@/controllers/exchange-controller'
import { cn } from '@/lib/utils'
import { useRequest, useUnmount } from 'ahooks'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Loading } from '../../../components/loading'
import { AppPreview } from './components/app-preview'
import { ChatInput } from './components/chat-input'
import { MessageList } from './components/message-exchange'
import BrowserTabView from './components/brwoser-tab-view'

const ChatView = observer(() => {
  const { t } = useTranslation()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { loading: historyLoading } = useRequest(
    () => exchangeController.fetchExchangeHistory(),
    {
      retryInterval: 300,
      retryCount: 5,
    }
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [
    historyLoading,
    exchangeController.exchangeHistories,
    exchangeController.activeExchange,
  ])

  useUnmount(() => {
    exchangeController.terminateSseMessage()
  })

  return appListController.selectedApp ? (
    <div className="h-0 flex-1 flex">
      {exchangeController.testing && (
        <BrowserTabView
          tabId={exchangeController.testTabId}
          domain='localhost:8083'
        />
      )}
      {!exchangeController.testing && exchangeController.previewMode !== 'disabled' && (
        <AppPreview
          className={cn(
            'h-full border-r shadow flex-2/3',
            exchangeController.previewMode === 'mobile' && 'max-w-[414px]'
          )}
        />
      )}

      <section className="h-full flex-1/3 flex flex-col min-w-[375px]">
        <div className="h-0 flex-1 pb-8 overflow-auto relative">
          <div className="max-w-[720px] m-auto px-4">
            {historyLoading ? (
              <Loading message={t('chat.historyLoading')} />
            ) : (
              <>
                <ExchangeHistoriesList />
                <ActiveExchange />
              </>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
        <ChatInput />
      </section>
    </div>
  ) : (
    <div className="flex-1 flex flex-col justify-center items-center gap-8 pb-48">
      <div className="flex items-center gap-4">
        <KiwiLogo logoClassName="size-10" />
        <p className="text-3xl font-bold">Kiwi AI</p>
      </div>

      <ChatInput className="w-full px-8" />
    </div>
  )
})

export default ChatView

const ExchangeHistoriesList = observer(() => (
  <MessageList exchanges={exchangeController.exchangeHistories} />
))
const ActiveExchange = observer(() => {
  if (!exchangeController.activeExchange) return null
  return <MessageList exchanges={[exchangeController.activeExchange]} />
})
