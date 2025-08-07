import { KiwiLogo } from '@/components/kiwi-logo'
import appListController from '@/controllers/app-list-controller'
import exchangeController from '@/controllers/exchange-controller'
import { nextTick } from '@/lib/utils'
import { useCreation, useRequest, useUnmount } from 'ahooks'
import { reaction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Loading } from '../../../components/loading'
import { AppPreview } from './components/app-preview'
import { ChatInput } from './components/chat-input'
import { MessageList } from './components/message-exchange'

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

  const disposeReaction = useCreation(
    () =>
      reaction(
        () => [
          exchangeController.exchangeHistories,
          exchangeController.activeExchange,
        ],
        async () => {
          await nextTick()
          messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
        }
      ),
    []
  )

  useUnmount(() => {
    exchangeController.terminateSseMessage()
    disposeReaction()
  })

  return appListController.selectedApp ? (
    <div className="h-0 flex-1 flex">
      {exchangeController.previewEnabled && (
        <AppPreview className="h-full flex-2/3 border-r shadow" />
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
