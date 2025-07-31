import {
  cancelGeneration as cancelGenerationApi,
  generateCode,
  getApplication,
  reconnectExchange,
  retryGeneration as retryGenerationApi,
  searchExchanges,
} from '@/api/app'
import i18n from '@/i18n'
import { sleep } from '@/lib/utils'
import { groupBy } from 'lodash'
import { makeAutoObservable, runInAction } from 'mobx'
import appListController from './app-list-controller'

const RUNNING_STATUSES = ['PLANNING', 'GENERATING']

class ExchangeController {
  isGenerating = false
  exchangeHistories: Exchange[] = []
  activeExchange: Nullable<Exchange> = null

  abortController: Nullable<AbortController> = null

  constructor() {
    makeAutoObservable(this)
  }

  async sendMessageToAI(prompt: string) {
    prompt = prompt.trim()
    if (!prompt) return

    this.abortController?.abort()
    this.abortController = new AbortController()
    this.isGenerating = true

    const initialExchange: Omit<Exchange, 'first'> = {
      id: `temp_${Date.now()}`,
      prompt,
      appId: appListController.selectedApp?.id || '',
      userId: '',
      status: 'PLANNING',
      stages: [],
      errorMessage: null,
      productURL: null,
      managementURL: null,
    }
    this.activeExchange = initialExchange as Exchange

    generateCode(
      { prompt, appId: appListController.selectedApp?.id },
      {
        onMessage: exchangeData => this.receiveSseMessage(exchangeData, prompt),
        onClose: () => this.receiveSseClose,
        onError: error => this.receiveSseError(error),
      },
      this.abortController.signal
    )
  }

  async cancelGeneration(exchangeId: string) {
    try {
      await cancelGenerationApi(exchangeId)

      if (this.activeExchange?.id === exchangeId) {
        const CanceledExchange = {
          ...this.activeExchange,
          status: 'CANCELLED' as const,
        }
        this.terminateSseMessage(CanceledExchange)
      } else {
        runInAction(() => {
          this.exchangeHistories = this.exchangeHistories.map(ex =>
            ex.id === exchangeId ? { ...ex, status: 'CANCELLED' as const } : ex
          )
        })
      }
    } catch (error) {
      console.error('Failed to cancel generation:', error)
    }
  }

  async retryGeneration(exchangeId: string) {
    const exchangeToRetry = this.exchangeHistories.find(
      ex => ex.id === exchangeId
    )
    if (!exchangeToRetry || this.isGenerating) return

    runInAction(() => {
      this.exchangeHistories = this.exchangeHistories.filter(
        ex => ex.id !== exchangeId
      )
    })
    this.isGenerating = true
    this.activeExchange = { ...exchangeToRetry, status: 'PLANNING' }
    this.abortController = new AbortController()

    retryGenerationApi(
      { exchangeId },
      {
        onMessage: exchangeData =>
          this.receiveSseMessage(exchangeData, exchangeToRetry.prompt),
        onClose: () => this.receiveSseClose,
        onError: error => this.receiveSseError(error),
      },
      this.abortController.signal
    )
  }

  async fetchExchangeHistory() {
    this.abortController?.abort()
    this.abortController = null
    this.activeExchange = null
    this.exchangeHistories = []
    const appId = appListController.selectedApp?.id || ''
    if (!appId) return

    // 新创建的应用会触发 selectApp 导致路由变化
    // 此时会查询历史数据，存在延迟
    await sleep(200)
    const data = await searchExchanges({
      appId,
      pageSize: 100,
    })
    const groupedExchanges = groupBy(data.items, ex => {
      return RUNNING_STATUSES.includes(ex.status) ? 'active' : 'completed'
    })
    const exchangeToReconnect = groupedExchanges['active']?.[0]

    runInAction(() => {
      if (exchangeToReconnect) {
        this.isGenerating = true
        this.activeExchange = exchangeToReconnect
        this.exchangeHistories = groupedExchanges['completed']?.reverse() || []
        this.abortController = new AbortController()

        reconnectExchange(
          { exchangeId: exchangeToReconnect.id },
          {
            onMessage: exchangeData => this.receiveSseMessage(exchangeData),
            onClose: () => this.receiveSseClose,
            onError: error => this.receiveSseError(error),
          },
          this.abortController.signal
        )
      } else {
        this.exchangeHistories = data.items.reverse()
      }
    })
  }

  async receiveSseMessage(exchangeData: Exchange, sentPrompt?: string) {
    if (!appListController.selectedApp && exchangeData.appId) {
      const newApp = await getApplication(exchangeData.appId)
      if (newApp) {
        this.abortController?.abort()
        appListController.addApp(newApp)
        appListController.selectApp(newApp, true)
      }
    }

    if (
      sessionStorage.getItem('newAppId') === appListController.selectedApp?.id
    ) {
      const backendStage = exchangeData.stages.find(s => s.type === 'BACKEND')
      if (backendStage?.status === 'GENERATING') {
        getApplication(exchangeData.appId).then(updatedApp => {
          if (updatedApp) {
            appListController.updateApp(updatedApp)
          }
        })
        sessionStorage.removeItem('newAppId')
      }
    }

    const finalExchangeData = sentPrompt
      ? { ...exchangeData, prompt: sentPrompt }
      : exchangeData
    runInAction(() => (this.activeExchange = finalExchangeData))

    if (
      finalExchangeData.status === 'SUCCESSFUL' ||
      finalExchangeData.status === 'FAILED' ||
      finalExchangeData.status === 'CANCELLED'
    ) {
      this.terminateSseMessage(finalExchangeData)
    }
  }

  receiveSseClose() {
    this.isGenerating = false
    this.abortController = null
  }

  receiveSseError(error: unknown) {
    const aborted = this.abortController?.signal.aborted
    this.isGenerating = false
    this.abortController = null
    console.error('SSE Error:', error)
    if (aborted) return
    this.activeExchange = this.activeExchange
      ? {
          ...this.activeExchange,
          status: 'FAILED',
          errorMessage: i18n.t('exchange.connectionError'),
        }
      : null
  }

  terminateSseMessage(exchangeData: Exchange) {
    this.exchangeHistories = [...this.exchangeHistories, exchangeData]
    this.activeExchange = null
    this.isGenerating = false
    this.abortController?.abort()
    this.abortController = null
  }
}

export default new ExchangeController()
