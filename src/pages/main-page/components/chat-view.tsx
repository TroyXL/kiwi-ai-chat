import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as appApi from '../../../api/app'
import { Attempt, Exchange, Stage } from '../../../api/types'
import { Spinner } from '../../../components/spinner'
import { useApps } from '../../../contexts/AppContext'

const SendIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 11L12 6L17 11M12 18V7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
  </svg>
)

const AttemptView = ({ attempt }: { attempt: Attempt }) => {
  const { t } = useTranslation()
  let statusIcon = '⏳'
  if (attempt.status === 'SUCCESSFUL') statusIcon = '✅'
  if (attempt.status === 'FAILED') statusIcon = '❌'

  return (
    <div className="attempt-view">
      <span>
        {statusIcon} {t('exchange.attemptLabel')}
      </span>
      {attempt.errorMessage && (
        <p className="error-message">{attempt.errorMessage}</p>
      )}
    </div>
  )
}

const StageView = ({ stage }: { stage: Stage }) => {
  const { t } = useTranslation()
  let statusIcon = '⏳'
  if (stage.status === 'COMMITTING') statusIcon = '📝'
  if (stage.status === 'SUCCESSFUL') statusIcon = '✅'
  if (stage.status === 'FAILED') statusIcon = '❌'

  return (
    <div className="stage-view">
      <div className="stage-header">
        <span>
          {statusIcon} {t('exchange.stageLabel')}:{' '}
          {t(`enums.stageType.${stage.type}` as const, stage.type)}
        </span>
        <span>
          ({t(`enums.stageStatus.${stage.status}` as const, stage.status)})
        </span>
      </div>
      <div className="stage-attempts">
        {stage.attempts.map(att => (
          <AttemptView key={att.id} attempt={att} />
        ))}
      </div>
    </div>
  )
}

interface ExchangeViewProps {
  exchange: Exchange
  onCancel: (exchangeId: string) => void
  onRetry: (exchangeId: string) => void
}

const ExchangeView = ({ exchange, onCancel, onRetry }: ExchangeViewProps) => {
  const { t } = useTranslation()
  const isRunning =
    exchange.status === 'PLANNING' || exchange.status === 'GENERATING'
  const isFailed = exchange.status === 'FAILED'
  const hasStages = exchange.stages && exchange.stages.length > 0

  return (
    <div className={`exchange-view ${hasStages ? 'has-stages' : ''}`}>
      <div className="exchange-status">
        <strong>{t('exchange.statusLabel')}:</strong>{' '}
        {t(`enums.status.${exchange.status}` as const, exchange.status)}
      </div>

      {hasStages && (
        <div className="exchange-stages">
          {exchange.stages.map(stage => (
            <StageView key={stage.id} stage={stage} />
          ))}
        </div>
      )}

      {(exchange.managementURL || exchange.productURL) && (
        <div className="exchange-result success">
          {exchange.status === 'SUCCESSFUL' && (
            <p>{t('exchange.processComplete')}</p>
          )}
          <div className="exchange-links-container">
            {exchange.managementURL && (
              <button
                className="visit-btn"
                onClick={() => {
                  if (exchange.managementURL)
                    window.open(exchange.managementURL, '_blank')
                }}
              >
                {t('exchange.visitManagement')}
              </button>
            )}
            {exchange.productURL && (
              <button
                className="visit-btn"
                onClick={() => {
                  if (exchange.productURL)
                    window.open(exchange.productURL, '_blank')
                }}
              >
                {t('exchange.visitApp')}
              </button>
            )}
          </div>
        </div>
      )}

      {exchange.status === 'FAILED' && (
        <div className="exchange-result error">
          <p>
            {t('exchange.generationFailed', { error: exchange.errorMessage })}
          </p>
        </div>
      )}
      {(isRunning || isFailed) && (
        <div className="exchange-actions">
          {isRunning && (
            <button
              className="exchange-action-btn cancel"
              onClick={() => onCancel(exchange.id)}
            >
              {t('exchange.cancelAction')}
            </button>
          )}
          {isFailed && (
            <button
              className="exchange-action-btn retry"
              onClick={() => onRetry(exchange.id)}
            >
              {t('exchange.retryAction')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export const ChatView = () => {
  const { t } = useTranslation()
  const {
    applications,
    addApplication,
    updateApplication,
    selectApp,
    selectedApp,
  } = useApps()
  const [prompt, setPrompt] = useState('')
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

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const handleTerminalMessage = (exchangeData: Exchange) => {
    setExchangeHistory(prevHistory => [...prevHistory, exchangeData])
    setActiveExchange(null)
    setIsGenerating(false)

    newAppGenerationInProgressRef.current = false
    renameRefreshPendingRef.current = false
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
  }

  const handleSseMessage = (exchangeData: Exchange, sentPrompt?: string) => {
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
      if (
        backendStage &&
        backendStage.attempts.some(a => a.status === 'SUCCESSFUL')
      ) {
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

  const handleSseClose = () => {
    setIsGenerating(false)
    newAppGenerationInProgressRef.current = false
    renameRefreshPendingRef.current = false
    abortControllerRef.current = null
  }

  const handleSseError = (err: any, controller: AbortController) => {
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

  const handleSend = useCallback(() => {
    if (!prompt.trim() || isGenerating) return

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

    setPrompt('')
  }, [
    prompt,
    isGenerating,
    selectedApp,
    addApplication,
    updateApplication,
    selectApp,
    t,
  ])

  const handleCancel = useCallback(
    async (exchangeId: string) => {
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
              ex.id === exchangeId
                ? { ...ex, status: 'CANCELLED' as const }
                : ex
            )
          )
        }
      } catch (error) {
        console.error('Failed to cancel generation:', error)
      }
    },
    [activeExchange]
  )

  const handleRetry = useCallback(
    (exchangeId: string) => {
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
    },
    [exchangeHistory, isGenerating, t]
  )

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="chat-messages-inner-wrapper">
          {!historyLoading &&
            exchangeHistory.map(ex => (
              <React.Fragment key={ex.id}>
                <div className="message user">
                  <div className="message-bubble">{ex.prompt}</div>
                </div>
                <div className="message ai">
                  <div className="message-bubble">
                    <ExchangeView
                      exchange={ex}
                      onCancel={handleCancel}
                      onRetry={handleRetry}
                    />
                  </div>
                </div>
              </React.Fragment>
            ))}

          {activeExchange && (
            <React.Fragment>
              <div className="message user">
                <div className="message-bubble">{activeExchange.prompt}</div>
              </div>
              <div className="message ai">
                <div className="message-bubble">
                  <ExchangeView
                    exchange={activeExchange}
                    onCancel={handleCancel}
                    onRetry={handleRetry}
                  />
                </div>
              </div>
            </React.Fragment>
          )}

          {historyLoading && (
            <p
              style={{
                textAlign: 'center',
                color: 'var(--gpt-text-secondary)',
              }}
            >
              {t('chat.historyLoading')}
            </p>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="chat-input-area">
        <div className="chat-input-area-inner">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={
              selectedApp
                ? t('chat.placeholderWithApp', { appName: selectedApp.name })
                : t('chat.placeholderNewApp')
            }
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            disabled={isGenerating}
          />
          <button
            onClick={handleSend}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? <Spinner /> : <SendIcon />}
          </button>
        </div>
        <p className="generation-note">{t('chat.generationNote')}</p>
      </div>
    </div>
  )
}
