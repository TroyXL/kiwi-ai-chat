import { searchExchanges } from '@/api/app'
import { sleep } from '@/lib/utils'
import { makeAutoObservable } from 'mobx'

const RUNNING_STATUSES = ['PLANNING', 'GENERATING']

class ExchangeController {
  isGenerating = false
  exchangeHistories: Exchange[] = []
  currentExchange: Nullable<Exchange> = null

  abortController: AbortController = new AbortController()

  constructor() {
    makeAutoObservable(this)
  }

  async fetchExchangeHistoryByAppId(appId: string) {
    // 新创建的应用会触发 selectApp 导致路由变化
    // 此时会查询历史数据，存在延迟
    await sleep(200)
    const data = await searchExchanges({
      appId,
      pageSize: 100,
    })
    const exchangeToReconnect = data.items.find(ex =>
      RUNNING_STATUSES.includes(ex.status)
    )

    if (exchangeToReconnect) {
      this.isGenerating = true
      this.currentExchange = exchangeToReconnect
      const completedHistory = data.items
        .filter(ex => ex.id !== exchangeToReconnect.id)
        .reverse()
      this.exchangeHistories = completedHistory

      const controller = new AbortController()
      this.abortController = controller

      // reconnectExchange(
      //   { exchangeId: exchangeToReconnect.id },
      //   {
      //     onMessage: exchangeData => handleSseMessage(exchangeData),
      //     onClose: () => handleSseClose(),
      //     onError: err => handleSseError(err, controller),
      //   },
      //   controller.signal
      // )
    } else {
      this.exchangeHistories = data.items.reverse()
    }
  }
}

export default new ExchangeController()
