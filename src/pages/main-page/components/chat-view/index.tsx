import { KiwiLogo } from '@/components/kiwi-logo'
import { useMemoizedFn } from 'ahooks'
import { memo, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as appApi from '../../../../api/app'
import { Exchange } from '../../../../api/types'
import { Loading } from '../../../../components/loading'
import { useApps } from '../../../../contexts/AppContext'
import { ChatInput } from './components/chat-input'
import { MessageList } from './components/message-exchange'

export const ChatView = memo(() => {
  const { t } = useTranslation()
  const {
    applications,
    addApplication,
    updateApplication,
    selectApp,
    selectedApp,
  } = useApps()
  const [isGenerating, setIsGenerating] = useState(false)

  const [activeExchange, setActiveExchange] = useState<Exchange | null>(null)
  const [exchangeHistory, setExchangeHistory] = useState<Exchange[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const [appToSelectId, setAppToSelectId] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const newAppGenerationInProgressRef = useRef<boolean>(false)
  const renameRefreshPendingRef = useRef<boolean>(false)
  const isAutoSelectingRef = useRef(false)

  useEffect(() => {
    if (isAutoSelectingRef.current) {
      isAutoSelectingRef.current = false
      return
    }

    abortControllerRef.current?.abort()
    setActiveExchange(null)
    setExchangeHistory([])

    if (selectedApp) {
      setHistoryLoading(true)
      appApi
        .searchExchanges({ appId: selectedApp.id, pageSize: 100 })
        .then(data => {
          const runningStatuses = ['PLANNING', 'GENERATING']
          const exchangeToReconnect = data.items.find(ex =>
            runningStatuses.includes(ex.status)
          )

          if (exchangeToReconnect) {
            const backendStage = exchangeToReconnect.stages.find(
              s => s.type === 'BACKEND'
            )
            const isBackendSuccessful =
              backendStage && backendStage.status === 'SUCCESSFUL'
            if (exchangeToReconnect.first && !isBackendSuccessful) {
              renameRefreshPendingRef.current = true
            }

            setIsGenerating(true)
            setActiveExchange(exchangeToReconnect)
            const completedHistory = data.items.filter(
              ex => ex.id !== exchangeToReconnect.id
            )
            setExchangeHistory([...completedHistory].reverse())

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
            setExchangeHistory([...data.items].reverse())
          }
        })
        .catch(err => console.error('Failed to fetch exchange history:', err))
        .finally(() => setHistoryLoading(false))
    }
  }, [selectedApp])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeExchange, exchangeHistory])

  useEffect(() => {
    if (appToSelectId && applications.length > 0) {
      const appToSelect = applications.find(app => app.id === appToSelectId)
      if (appToSelect) {
        isAutoSelectingRef.current = true
        selectApp(appToSelect)
        setAppToSelectId(null)
      }
    }
  }, [applications, appToSelectId, selectApp])

  useEffect(
    () => () => {
      abortControllerRef.current?.abort()
    },
    []
  )

  const handleTerminalMessage = useMemoizedFn((exchangeData: Exchange) => {
    setExchangeHistory(prevHistory => [...prevHistory, exchangeData])
    setActiveExchange(null)
    setIsGenerating(false)

    newAppGenerationInProgressRef.current = false
    renameRefreshPendingRef.current = false
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
  })

  const handleSseMessage = useMemoizedFn(
    (exchangeData: Exchange, sentPrompt?: string) => {
      if (newAppGenerationInProgressRef.current && exchangeData.appId) {
        appApi.getApplication(exchangeData.appId).then(newApp => {
          if (newApp) {
            addApplication(newApp)
            setAppToSelectId(newApp.id)
          }
        })
        newAppGenerationInProgressRef.current = false
      }

      if (renameRefreshPendingRef.current && exchangeData.appId) {
        const backendStage = exchangeData.stages.find(s => s.type === 'BACKEND')
        if (backendStage && backendStage.status === 'SUCCESSFUL') {
          appApi.getApplication(exchangeData.appId).then(updatedApp => {
            if (updatedApp) {
              updateApplication(updatedApp)
            }
          })
          renameRefreshPendingRef.current = false
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
    newAppGenerationInProgressRef.current = false
    renameRefreshPendingRef.current = false
    abortControllerRef.current = null
  })

  const handleSseError = useMemoizedFn(
    (err: any, controller: AbortController) => {
      setIsGenerating(false)
      newAppGenerationInProgressRef.current = false
      renameRefreshPendingRef.current = false
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
    if (!selectedApp) {
      newAppGenerationInProgressRef.current = true
      renameRefreshPendingRef.current = true
    }

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
