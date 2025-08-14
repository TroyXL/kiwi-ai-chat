import { MdRenderer } from '@/components/md-renderer'
import { Spinner } from '@/components/spinner'
import { Tag } from '@/components/tag'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import exchangeController, {
  STATUSES_FINISHED,
  STATUSES_RUNNING,
} from '@/controllers/exchange-controller'
import extractFileInfo from '@/lib/extractFileInfo'
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
  Undo2,
} from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { OpenWebsitesButton } from '../../components/open-websites-button'

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
  return (
    <li>
      <div className="flex justify-end pt-8">
        <MdRenderer
          className="px-4 py-3 rounded-md rounded-tr-none bg-blue-600/20 text-foreground"
          content={exchange.prompt}
        />
      </div>

      <KiwiResponseView exchange={exchange} />
    </li>
  )
})

const KiwiResponseView = memo(({ exchange }: ExchangeProps) => {
  const { t } = useTranslation()

  const hasStages = !!exchange.stages?.length

  const statusLabel = useCreation(() => {
    if (exchange.status === 'SUCCESSFUL') {
      return t('exchange.processComplete')
    }
    if (exchange.status === 'FAILED') {
      return t('exchange.generationFailed', {
        error: exchange.errorMessage || '-',
      })
    }
    if (exchange.status === 'CANCELLED') {
      return t(`enums.status.${exchange.status}`, exchange.status)
    }
    if (exchange.status === 'REVERTED') {
      return t(`enums.status.${exchange.status}`, exchange.status)
    }
    return t('exchange.processing')
  }, [exchange.status])

  return (
    <section className="pt-8 flex flex-col">
      <KiwiResponseStatus exchange={exchange} />

      <ul>
        {exchange.stages?.map(stage => (
          <KiwiResponseStage key={stage.id} stage={stage} />
        ))}
      </ul>

      {!hasStages && <div className="border h-4 w-0 ml-12" />}

      <div className="flex justify-between items-center gap-4 border bg-card rounded-md px-4 py-3">
        <p className="font-medium">{statusLabel}</p>

        <OpenWebsitesButton
          small
          productUrl={exchange.productURL}
          managementUrl={exchange.managementURL}
        />
      </div>
    </section>
  )
})

const KiwiResponseStatus = observer(({ exchange }: ExchangeProps) => {
  const { t } = useTranslation()

  const fileInfos = useCreation(
    () => exchange.attachmentUrls?.map(extractFileInfo) || [],
    [exchange.attachmentUrls]
  )

  const isRunning = STATUSES_RUNNING.includes(exchange.status)
  const isFailed = exchange.status === 'FAILED'
  const allowRevert =
    // 不存在活跃中的记录
    !exchangeController.activeExchange &&
    // 历史记录中的最后一项
    exchange ===
      exchangeController.exchangeHistories[
        exchangeController.exchangeHistories.length - 1
      ] &&
    // 状态为已结束
    STATUSES_FINISHED.includes(exchange.status)

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
    case 'REVERTED':
      icon = <Undo2 size={20} />
      break
  }

  return (
    <Alert variant="default">
      <AlertTitle className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {icon}
          <p>
            {t('exchange.statusLabel')}
            {t(`enums.status.${exchange.status}`, exchange.status)}
          </p>
        </div>

        <div className="space-x-2">
          {isRunning && (
            <Button
              size="xs"
              variant="secondary"
              onClick={() => exchangeController.cancelGeneration(exchange.id)}
            >
              {t('exchange.cancelAction')}
            </Button>
          )}
          {isFailed && (
            <Button
              size="xs"
              variant="secondary"
              onClick={() => exchangeController.retryGeneration(exchange.id)}
            >
              {t('exchange.retryAction')}
            </Button>
          )}
          {allowRevert && (
            <Button
              size="xs"
              variant="secondary"
              onClick={() => exchangeController.revertGeneration(exchange.id)}
            >
              {exchangeController.isReverting ? (
                <Spinner />
              ) : (
                t('exchange.revertAction')
              )}
            </Button>
          )}
        </div>
      </AlertTitle>

      {fileInfos.length > 0 && (
        <AlertDescription>
          <div className="flex flex-wrap gap-2 mt-2">
            {fileInfos.map(file => (
              <Tag key={file.id}>{file.fileName}</Tag>
            ))}
          </div>
        </AlertDescription>
      )}
    </Alert>
  )
})

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
        <span className="p-1.5 bg-background text-foreground rounded-full -translate-x-1/2">
          {icon}
        </span>
        <p className="flex-1 w-0 flex justify-between pr-4">
          <span>
            {t('exchange.stageLabel')}
            {t(`enums.stageType.${stage.type}`, stage.type)}
          </span>
          <span>{t(`enums.stageStatus.${stage.status}`, stage.status)}</span>
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
