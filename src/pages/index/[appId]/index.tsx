import { KiwiLogo } from '@/components/kiwi-logo'
import { sleep } from '@/lib/utils'
import { useMemoizedFn, useRequest, useUnmount } from 'ahooks'
import { memo, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as appApi from '../../../api/app'
import { Exchange } from '../../../api/types'
import { Loading } from '../../../components/loading'
import { useApps } from '../../../contexts/AppContext'
import { ChatInput } from './components/chat-input'
import { MessageList } from './components/message-exchange'

const runningStatuses = ['PLANNING', 'GENERATING']

const ChatView = memo(() => {
  const { t } = useTranslation()
  const { addApplication, updateApplication, selectApp, selectedApp } =
    useApps()
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeExchange, setActiveExchange] = useState<Exchange | null>(null)
  const [exchangeHistory, setExchangeHistory] = useState<Exchange[]>([])

  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const renameRefreshPendingRef = useRef<boolean>(
    !!(selectedApp && sessionStorage.getItem('newAppId') === selectedApp?.id)
  )

  const { loading: historyLoading } = useRequest(
    async () => {
      abortControllerRef.current?.abort()
      setActiveExchange(null)
      setExchangeHistory([])
      if (!selectedApp) return

      // 新创建的应用会触发 selectApp 导致路由变化
      // 此时会查询历史数据，存在延迟
      await sleep(200)
      const data = await appApi.searchExchanges({
        appId: selectedApp.id,
        pageSize: 100,
      })
      const exchangeToReconnect = data.items.find(ex =>
        runningStatuses.includes(ex.status)
      )

      if (exchangeToReconnect) {
        setIsGenerating(true)
        setActiveExchange(exchangeToReconnect)
        const completedHistory = data.items
          .filter(ex => ex.id !== exchangeToReconnect.id)
          .reverse()
        setExchangeHistory(completedHistory)

        const controller = new AbortController()
        abortControllerRef.current = controller

        appApi.reconnectExchange(
          { exchangeId: exchangeToReconnect.id },
          {
            onMessage: exchangeData => handleSseMessage(exchangeData),
            onClose: () => handleSseClose(),
            onError: err => handleSseError(err, controller),
          },
          controller.signal
        )
      } else {
        setExchangeHistory(data.items.reverse())
      }
    },
    {
      onError(error) {
        console.error('Failed to fetch exchange history:', error)
      },
    }
  )

  useUnmount(() => abortControllerRef.current?.abort())

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [activeExchange, exchangeHistory])

  const handleTerminalMessage = useMemoizedFn((exchangeData: Exchange) => {
    setExchangeHistory(prevHistory => [...prevHistory, exchangeData])
    setActiveExchange(null)
    setIsGenerating(false)

    abortControllerRef.current?.abort()
    abortControllerRef.current = null
  })

  const handleSseMessage = useMemoizedFn(
    async (exchangeData: Exchange, sentPrompt?: string) => {
      if (!selectedApp && exchangeData.appId) {
        const newApp = await appApi.getApplication(exchangeData.appId)
        if (newApp) {
          abortControllerRef.current?.abort()
          addApplication(newApp)
          selectApp(newApp, { isNewApp: true })
        }
      }

      if (renameRefreshPendingRef.current && exchangeData.appId) {
        const backendStage = exchangeData.stages.find(s => s.type === 'BACKEND')
        if (backendStage?.status === 'GENERATING') {
          appApi.getApplication(exchangeData.appId).then(updatedApp => {
            if (updatedApp) {
              updateApplication(updatedApp)
            }
          })
          renameRefreshPendingRef.current = false
          sessionStorage.removeItem('newAppId')
        }
      }

      const finalExchangeData = sentPrompt
        ? { ...exchangeData, prompt: sentPrompt }
        : exchangeData
      setActiveExchange(finalExchangeData)

      if (
        finalExchangeData.status === 'SUCCESSFUL' ||
        finalExchangeData.status === 'FAILED' ||
        finalExchangeData.status === 'CANCELLED'
      ) {
        handleTerminalMessage(finalExchangeData)
      }
    }
  )

  const handleSseClose = useMemoizedFn(() => {
    setIsGenerating(false)
    abortControllerRef.current = null
  })

  const handleSseError = useMemoizedFn(
    (err: any, controller: AbortController) => {
      setIsGenerating(false)
      abortControllerRef.current = null
      console.error('SSE Error:', err)
      if (controller.signal.aborted) {
        return
      }
      setActiveExchange(prev =>
        prev
          ? {
              ...prev,
              status: 'FAILED',
              errorMessage: t('exchange.connectionError'),
            }
          : null
      )
    }
  )

  const handleSend = useMemoizedFn((prompt: string) => {
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    const sentPrompt = prompt
    setIsGenerating(true)

    const tempId = `temp_${Date.now()}`
    const initialExchange: Omit<Exchange, 'first'> = {
      id: tempId,
      prompt: sentPrompt,
      appId: selectedApp?.id || '',
      userId: '',
      status: 'PLANNING',
      stages: [],
      errorMessage: null,
      productURL: null,
      managementURL: null,
    }
    setActiveExchange(initialExchange as Exchange)

    appApi.generateCode(
      { prompt: sentPrompt, appId: selectedApp?.id },
      {
        onMessage: exchangeData => handleSseMessage(exchangeData, sentPrompt),
        onClose: () => handleSseClose(),
        onError: err => handleSseError(err, controller),
      },
      controller.signal
    )
  })

  const handleCancel = useMemoizedFn(async (exchangeId: string) => {
    try {
      await appApi.cancelGeneration(exchangeId)

      if (activeExchange?.id === exchangeId) {
        const CanceledExchange = {
          ...activeExchange,
          status: 'CANCELLED' as const,
        }
        handleTerminalMessage(CanceledExchange)
      } else {
        setExchangeHistory(prev =>
          prev.map(ex =>
            ex.id === exchangeId ? { ...ex, status: 'CANCELLED' as const } : ex
          )
        )
      }
    } catch (error) {
      console.error('Failed to cancel generation:', error)
    }
  })

  const handleRetry = useMemoizedFn((exchangeId: string) => {
    const exchangeToRetry = exchangeHistory.find(ex => ex.id === exchangeId)
    if (!exchangeToRetry || isGenerating) return

    setExchangeHistory(prev => prev.filter(ex => ex.id !== exchangeId))
    setIsGenerating(true)
    setActiveExchange({ ...exchangeToRetry, status: 'PLANNING' })

    const controller = new AbortController()
    abortControllerRef.current = controller

    appApi.retryGeneration(
      { exchangeId },
      {
        onMessage: exchangeData =>
          handleSseMessage(exchangeData, exchangeToRetry.prompt),
        onClose: () => handleSseClose(),
        onError: err => handleSseError(err, controller),
      },
      controller.signal
    )
  })

  return selectedApp ? (
    <>
      <div className="h-0 flex-1 pb-8 overflow-auto relative">
        <div className="max-w-[720px] m-auto px-4">
          {historyLoading ? (
            <Loading message={t('chat.historyLoading')} />
          ) : (
            <>
              <MessageList
                exchanges={exchangeHistory}
                onCancel={handleCancel}
                onRetry={handleRetry}
              />

              {activeExchange && (
                <MessageList
                  exchanges={[activeExchange]}
                  onCancel={handleCancel}
                  onRetry={handleRetry}
                />
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput generating={isGenerating} onSend={handleSend} />
    </>
  ) : (
    <div className="flex-1 flex flex-col justify-center items-center gap-8 pb-48">
      <div className="flex items-center gap-4">
        <KiwiLogo logoClassName="size-10" />
        <p className="text-3xl font-bold">Kiwi AI</p>
      </div>

      <ChatInput
        className="w-full px-8"
        generating={isGenerating}
        onSend={handleSend}
      />
    </div>
  )
})

export default ChatView
