/**
 * Host端通信模块
 * 负责与Preview iframe进行通信
 */

import { MessageType } from '../shared'

/**
 * DOM加载完成事件的回调函数类型
 */
type DOMLoadedCallback = () => void

/**
 * DOM内容回调函数类型
 */
type DOMContentCallback = (content: string) => void

/**
 * Host端的消息通道类
 * 负责与Preview iframe进行通信
 */
class HostMessageChannel {
  private static instance: HostMessageChannel
  private targetOrigin: string = '*' // 允许任何来源，可以根据安全需求进行限制
  private _previewIframe: HTMLIFrameElement | null = null

  // 回调函数集合
  private domLoadedCallbacks: DOMLoadedCallback[] = []
  private domContentCallbacks: DOMContentCallback[] = []
  private logsContentCallbacks: ((logs: ILogEvent[]) => void)[] = []
  private execScriptFinishCallbacks: (() => void)[] = []
  private screenshotCallbacks: ((
    screenshotData: IScreenshotData | null
  ) => void)[] = []
  private channelSupportedCallbacks: ((supported: boolean) => void)[] = []

  get previewIframe() {
    return this._previewIframe ?? document.querySelector('iframe')
  }

  private constructor() {
    this.initMessageListener()
  }

  /**
   * 获取单例实例
   */
  static getInstance(): HostMessageChannel {
    if (!HostMessageChannel.instance) {
      HostMessageChannel.instance = new HostMessageChannel()
    }
    return HostMessageChannel.instance
  }

  /**
   * 设置Preview iframe元素
   */
  setPreviewIframe(iframe: HTMLIFrameElement): void {
    this._previewIframe = iframe
  }

  /**
   * 初始化消息监听器
   */
  private initMessageListener(): void {
    window.addEventListener('message', this.handleMessage.bind(this))
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(event: MessageEvent): void {
    const message = event.data as IMessage

    if (!message || !message.type) return

    switch (message.type) {
      case MessageType.DOM_LOADED:
        // 处理DOM加载完成事件
        this.handleDOMLoaded()
        break

      case MessageType.DOM_CONTENT:
        // 处理接收到的DOM内容
        this.handleDOMContent(message.payload)
        break

      case MessageType.LOGS_CONTENT:
        // 处理接收到的日志内容
        this.handleLogsContent(message.payload)
        break

      case MessageType.SCREENSHOT_CONTENT:
        // 处理接收到的截图内容
        this.handleScreenshotContent(message.payload)
        break

      case MessageType.CHANNEL_SUPPORTED:
        // 处理接收到的通道支持状态
        this.handleChannelSupported(message.payload)
        break

      default:
        console.log('Host: Unknown message type', message.type)
    }
  }

  /**
   * 发送消息给Preview
   */
  private sendMessage(message: IMessage): void {
    if (this.previewIframe?.contentWindow) {
      this.previewIframe.contentWindow.postMessage(message, this.targetOrigin)
    } else {
      console.warn(
        'Preview iframe not set or contentWindow not available:' + message.type
      )
    }
  }

  /**
   * 处理DOM加载完成事件
   */
  private handleDOMLoaded(): void {
    // 触发所有DOM加载完成的回调函数
    this.domLoadedCallbacks.forEach(callback => callback())
    this.domLoadedCallbacks = []
  }

  private handleExecScriptFinish() {
    this.execScriptFinishCallbacks.forEach(callback => callback())
    this.execScriptFinishCallbacks = []
  }

  /**
   * 处理接收到的截图内容
   */
  private handleScreenshotContent(
    screenshotData: IScreenshotData | null
  ): void {
    // 触发所有截图内容回调函数
    this.screenshotCallbacks.forEach(callback => callback(screenshotData))
  }

  /**
   * 处理接收到的DOM内容
   */
  private handleDOMContent(content: string): void {
    // 触发所有DOM内容回调函数
    this.domContentCallbacks.forEach(callback => callback(content))
    // 清空回调函数列表，因为这是一次性请求
    this.domContentCallbacks = []
  }

  /**
   * 注册DOM加载完成事件的回调函数
   */
  onDOMLoaded(callback: DOMLoadedCallback): void {
    this.domLoadedCallbacks.push(callback)
  }

  /**
   * 注册截图内容回调函数
   */
  onScreenshot(
    callback: (screenshotData: IScreenshotData | null) => void
  ): void {
    this.screenshotCallbacks.push(callback)
  }

  /**
   * 请求获取页面截图
   */
  async getScreenshot(): Promise<IScreenshotData | null> {
    return new Promise(resolve => {
      // 添加回调函数
      this.screenshotCallbacks.push(screenshotData => {
        resolve(screenshotData)
      })

      // 发送获取截图的请求
      this.sendMessage({
        type: MessageType.GET_SCREENSHOT,
      })
    })
  }

  /**
   * 发送刷新页面的请求
   */
  refreshPreview(): void {
    this.sendMessage({
      type: MessageType.REFRESH,
    })
  }

  /**
   * 获取Preview的完整DOM内容
   */
  async getDOMContent(): Promise<string> {
    return new Promise(resolve => {
      // 添加回调函数
      this.domContentCallbacks.push(content => {
        resolve(content)
      })

      // 发送获取DOM内容的请求
      this.sendMessage({
        type: MessageType.GET_DOM_CONTENT,
      })
    })
  }

  /**
   * 处理接收到的日志内容
   */
  private handleLogsContent(logs: ILogEvent[]): void {
    // 触发所有日志内容回调函数
    this.logsContentCallbacks.forEach(callback => callback(logs))
    // 清空回调函数列表，因为这是一次性请求
    this.logsContentCallbacks = []
  }

  /**
   * 获取Preview中捕获的所有日志
   */
  async getLogsContent(): Promise<ILogEvent[]> {
    return new Promise(resolve => {
      // 添加回调函数
      this.logsContentCallbacks.push(logs => {
        resolve(logs)
      })

      // 发送获取日志内容的请求
      this.sendMessage({
        type: MessageType.GET_LOGS_CONTENT,
      })
    })
  }

  /**
   * 处理接收到的通道支持状态
   */
  private handleChannelSupported(supported: boolean): void {
    // 执行所有回调函数
    this.channelSupportedCallbacks.forEach(callback => {
      callback(supported)
    })

    // 清空回调函数列表
    this.channelSupportedCallbacks = []
  }

  /**
   * 获取Preview中的通道支持状态
   * 如果在100ms内未获取到则返回false
   */
  async getChannelSupported(): Promise<boolean> {
    return new Promise(resolve => {
      // 设置超时定时器
      const timeoutId = setTimeout(() => {
        // 超时后返回false
        resolve(false)

        // 清空回调函数列表
        this.channelSupportedCallbacks = []
      }, 100)

      // 添加回调函数
      this.channelSupportedCallbacks.push(supported => {
        // 清除超时定时器
        clearTimeout(timeoutId)

        // 返回支持状态
        resolve(supported)
      })

      // 发送获取通道支持状态的请求
      this.sendMessage({
        type: MessageType.GET_CHANNEL_SUPPORTED,
      })
    })
  }

}

/**
 * 获取通道支持状态
 * 如果在100ms内未获取到则返回false
 */
export async function isChannelSupported(): Promise<boolean> {
  return await hostMessageChannel.getChannelSupported()
}

// 导出单例实例
const hostMessageChannel = HostMessageChannel.getInstance()
export default hostMessageChannel
