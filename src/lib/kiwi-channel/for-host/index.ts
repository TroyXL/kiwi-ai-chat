/**
 * Host端通信模块
 * 负责与Preview iframe进行通信
 */

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
export class HostMessageChannel {
  private static instance: HostMessageChannel
  private targetOrigin: string = '*' // 允许任何来源，可以根据安全需求进行限制
  private previewIframe: HTMLIFrameElement | null = null

  // 回调函数集合
  private domLoadedCallbacks: DOMLoadedCallback[] = []
  private domContentCallbacks: DOMContentCallback[] = []

  private constructor() {
    this.initMessageListener()
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): HostMessageChannel {
    if (!HostMessageChannel.instance) {
      HostMessageChannel.instance = new HostMessageChannel()
    }
    return HostMessageChannel.instance
  }

  /**
   * 设置Preview iframe元素
   */
  public setPreviewIframe(iframe: HTMLIFrameElement): void {
    this.previewIframe = iframe
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

      default:
        console.log('Host: Unknown message type', message.type)
    }
  }

  /**
   * 发送消息给Preview
   */
  private sendMessage(message: IMessage): void {
    if (this.previewIframe && this.previewIframe.contentWindow) {
      this.previewIframe.contentWindow.postMessage(message, this.targetOrigin)
    } else {
      console.error('Preview iframe not set or contentWindow not available')
    }
  }

  /**
   * 处理DOM加载完成事件
   */
  private handleDOMLoaded(): void {
    // 触发所有DOM加载完成的回调函数
    this.domLoadedCallbacks.forEach(callback => callback())
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
  public onDOMLoaded(callback: DOMLoadedCallback): void {
    this.domLoadedCallbacks.push(callback)
  }

  /**
   * 发送刷新页面的请求
   */
  public refreshPreview(): void {
    this.sendMessage({
      type: MessageType.REFRESH,
    })
  }

  /**
   * 获取Preview的完整DOM内容
   */
  public getDOMContent(callback: DOMContentCallback): void {
    // 添加回调函数
    this.domContentCallbacks.push(callback)

    // 发送获取DOM内容的请求
    this.sendMessage({
      type: MessageType.GET_DOM_CONTENT,
    })
  }
}

// 导出单例实例
export default HostMessageChannel.getInstance()
