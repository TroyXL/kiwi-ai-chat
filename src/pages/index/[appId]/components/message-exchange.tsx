import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import exchangeController from '@/controllers/exchange-controller'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { useCreation } from 'ahooks'
import {
  ChevronsLeftRightEllipsis,
  CircleCheckBig,
  CircleXIcon,
  ClockFading,
  Hourglass,
  MonitorCheck,
  MonitorOff,
  MonitorX,
  PencilRuler,
} from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

type ExchangeProps = {
  exchange: Exchange
}

export const MessageList = memo(({ exchanges }: { exchanges: Exchange[] }) => {
  return (
    <ul>
      {exchanges.map(ex => (
        <MessageBubble key={ex.id} exchange={ex} />
      ))}
    </ul>
  )
})

const MessageBubble = memo(({ exchange }: ExchangeProps) => {
  const splitedPrompts = useCreation(
    () => exchange.prompt?.split('\n').filter(Boolean) || [],
    [exchange.prompt]
  )
  return (
    <li>
      <div className="flex justify-end pt-8">
        <section className="px-4 py-3 rounded-md rounded-tr-none bg-blue-600/20 text-foreground">
          {splitedPrompts.map((prompt, index) => (
            <p key={index}>{prompt}</p>
          ))}
        </section>
      </div>

      <KiwiResponseView exchange={exchange} />
    </li>
  )
})

const KiwiResponseView = memo(({ exchange }: ExchangeProps) => {
  const isMobile = useIsMobile()
  const { t } = useTranslation()
  const isSuccess = exchange.status === 'SUCCESSFUL'
  const isFailed = exchange.status === 'FAILED'
  const isCancelled = exchange.status === 'CANCELLED'
  const hasStages = !!exchange.stages?.length

  return (
    <section className="pt-8 flex flex-col">
      <KiwiResponseStatus exchange={exchange} />

      <ul>
        {exchange.stages?.map(stage => (
          <KiwiResponseStage key={stage.id} stage={stage} />
        ))}
      </ul>

      {!hasStages && <div className="border h-4 w-0 ml-12" />}

      <div
        className={cn(
          'border bg-card rounded-md px-4 py-3',
          !isMobile && 'flex justify-between items-center gap-4'
        )}
      >
        <p className="font-medium">
          {isSuccess
            ? t('exchange.processComplete')
            : isFailed
            ? t('exchange.generationFailed', { error: exchange.errorMessage })
            : isCancelled
            ? t(`enums.status.${exchange.status}` as const, exchange.status)
            : t('exchange.processing')}
        </p>

        <div className={isMobile ? ' space-x-3 mt-3 text-right' : 'space-x-2'}>
          {exchange.managementURL && (
            <Button
              size="xs"
              onClick={() => {
                window.open(exchange.managementURL!, '_blank')
              }}
            >
              {t('exchange.visitManagement')}
            </Button>
          )}
          {exchange.productURL && (
            <Button
              size="xs"
              onClick={() => {
                window.open(exchange.productURL!, '_blank')
              }}
            >
              {t('exchange.visitApp')}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
})

const KiwiResponseStatus = memo(
  ({ exchange }: ExchangeProps) => {
    const { t } = useTranslation()

    const isRunning =
      exchange.status === 'PLANNING' || exchange.status === 'GENERATING'
    const isFailed = exchange.status === 'FAILED'

    let icon = <Hourglass size={20} />
    switch (exchange.status) {
      case 'GENERATING':
        icon = <ChevronsLeftRightEllipsis size={20} />
        break
      case 'SUCCESSFUL':
        icon = <MonitorCheck size={20} />
        break
      case 'FAILED':
        icon = <MonitorX size={20} />
        break
      case 'CANCELLED':
        icon = <MonitorOff size={20} />
        break
    }

    return (
      <Alert variant="default">
        <AlertTitle className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {icon}
            <p>
              {t('exchange.statusLabel')}
              {t(`enums.status.${exchange.status}` as const, exchange.status)}
            </p>
          </div>

          {isRunning && (
            <Button
              size="xs"
              onClick={() => exchangeController.cancelGeneration(exchange.id)}
            >
              {t('exchange.cancelAction')}
            </Button>
          )}
          {isFailed && (
            <Button
              size="xs"
              onClick={() => exchangeController.retryGeneration(exchange.id)}
            >
              {t('exchange.retryAction')}
            </Button>
          )}
        </AlertTitle>
      </Alert>
    )
  },
  (prev, next) => prev.exchange.status === next.exchange.status
)

const KiwiResponseStage = memo(({ stage }: { stage: Stage }) => {
  const { t } = useTranslation()
  let icon = <ClockFading size={14} />

  switch (stage.status) {
    case 'COMMITTING':
      icon = <PencilRuler size={14} />
      break
    case 'SUCCESSFUL':
      icon = <CircleCheckBig size={14} />
      break
    case 'FAILED':
      icon = <CircleXIcon size={14} />
      break
  }

  return (
    <li className="relative ml-12 border-l-2 pl-4 py-3">
      <div className="flex items-center -ml-4">
        <span className="p-1.5 bg-muted text-foreground rounded-full -translate-x-1/2">
          {icon}
        </span>
        <p className="flex-1 w-0 flex justify-between">
          <span>
            {t('exchange.stageLabel')}
            {t(`enums.stageType.${stage.type}` as const, stage.type)}
          </span>
          <span>
            {t(`enums.stageStatus.${stage.status}` as const, stage.status)}
          </span>
        </p>
      </div>
      <ul>
        {stage.attempts?.map(attempt => (
          <KiwiResponseAttempt key={attempt.id} attempt={attempt} />
        ))}
      </ul>
    </li>
  )
})

const KiwiResponseAttempt = memo(({ attempt }: { attempt: Attempt }) => {
  const { t } = useTranslation()
  const splitedErrorMessages = useCreation(
    () => attempt.errorMessage?.split('\n').filter(Boolean) || [],
    [attempt.errorMessage]
  )
  let icon = <ClockFading size={14} />

  switch (attempt.status) {
    case 'SUCCESSFUL':
      icon = <CircleCheckBig />
      break
    case 'FAILED':
      icon = <CircleXIcon />
      break
  }

  return (
    <li className="mt-4">
      <Alert variant={attempt.errorMessage ? 'destructive' : 'default'}>
        {icon}
        <AlertTitle>{t('exchange.attemptLabel')}</AlertTitle>
        {splitedErrorMessages.length && (
          <AlertDescription className="error-message">
            {splitedErrorMessages.map((message, index) => (
              <p key={index}>{message}</p>
            ))}
          </AlertDescription>
        )}
      </Alert>
    </li>
  )
})
