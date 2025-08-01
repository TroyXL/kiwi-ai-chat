import {
  cancelGeneration as cancelGenerationApi,
  generateCode,
  getApplication,
  reconnectExchange,
  retryGeneration as retryGenerationApi,
  revertGeneration as revertGenerationApi,
  searchExchanges,
} from '@/api/app'
import i18n from '@/i18n'
import { groupBy } from 'lodash'
import { makeAutoObservable, runInAction } from 'mobx'
import appListController from './app-list-controller'

export const STATUSES_RUNNING = ['PLANNING', 'GENERATING']
export const STATUSES_FINISHED = ['SUCCESSFUL', 'FAILED']

class ExchangeController {
  isGenerating = false
  isReverting = false
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

    // const initialExchange: Omit<Exchange, 'first'> = {
    //   id: `temp_${Date.now()}`,
    //   prompt,
    //   appId: appListController.selectedApp?.id || '',
    //   userId: '',
    //   status: 'PLANNING',
    //   stages: [],
    //   errorMessage: null,
    //   productURL: null,
    //   managementURL: null,
    // }
    // this.activeExchange = initialExchange as Exchange

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

    this.exchangeHistories = this.exchangeHistories.filter(
      ex => ex.id !== exchangeId
    )
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

  async revertGeneration(exchangeId: string) {
    this.isReverting = true
    try {
      await revertGenerationApi(exchangeId)
      runInAction(
        () =>
          (this.exchangeHistories = this.exchangeHistories.map(ex => {
            if (ex.id !== exchangeId) return ex
            return { ...ex, status: 'REVERTED' as const }
          }))
      )
    } finally {
      this.isReverting = false
    }
  }

  async fetchExchangeHistory() {
    this.abortController?.abort()
    this.abortController = null
    this.activeExchange = null
    this.exchangeHistories = []
    const appId = appListController.selectedApp?.id || ''
    if (!appId) return

    const data = await searchExchanges({
      appId,
      pageSize: 100,
    })
    if (!data.items?.length) throw new Error('No exchange history found')

    const groupedExchanges = groupBy(data.items, ex => {
      return STATUSES_RUNNING.includes(ex.status) ? 'active' : 'completed'
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

  private async receiveSseMessage(exchangeData: Exchange, sentPrompt?: string) {
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
      if (
        exchangeData.stages.some(
          s => s.type === 'BACKEND' && s.status === 'GENERATING'
        )
      ) {
        const updatedApp = await getApplication(exchangeData.appId)
        if (updatedApp) {
          appListController.updateApp(updatedApp)
        }
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

  private receiveSseClose() {
    this.isGenerating = false
    this.abortController = null
  }

  private receiveSseError(error: unknown) {
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

  terminateSseMessage(exchangeData?: Exchange) {
    if (exchangeData)
      this.exchangeHistories = [...this.exchangeHistories, exchangeData]
    this.activeExchange = null
    this.isGenerating = false
    this.abortController?.abort()
    this.abortController = null
  }
}

export default new ExchangeController()
