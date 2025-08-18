/**
 * Preview端通信模块
 * 负责与Host进行通信
 */

/**
 * Preview端的消息通道类
 * 负责与Host进行通信
 */
export class PreviewMessageChannel {
  private static instance: PreviewMessageChannel
  private targetOrigin: string = '*' // 允许任何来源，可以根据安全需求进行限制

  private constructor() {
    this.initMessageListener()
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): PreviewMessageChannel {
    if (!PreviewMessageChannel.instance) {
      PreviewMessageChannel.instance = new PreviewMessageChannel()
    }
    return PreviewMessageChannel.instance
  }

  /**
   * 初始化消息监听器
   */
  private initMessageListener(): void {
    window.addEventListener('message', this.handleMessage.bind(this))

    // 当DOM加载完成时，发送DOM_LOADED消息给Host
    window.addEventListener('DOMContentLoaded', () => {
      this.sendMessage({
        type: MessageType.DOM_LOADED,
      })
    })
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(event: MessageEvent): void {
    const message = event.data as IMessage

    if (!message || !message.type) return

    switch (message.type) {
      case MessageType.REFRESH:
        // 处理刷新页面的请求
        window.location.reload()
        break

      case MessageType.GET_DOM_CONTENT:
        // 处理获取当前完整DOM内容的请求
        this.sendDOMContent()
        break

      default:
        console.log('Preview: Unknown message type', message.type)
    }
  }

  /**
   * 发送消息给Host
   */
  public sendMessage(message: IMessage): void {
    if (window.parent) {
      window.parent.postMessage(message, this.targetOrigin)
    }
  }

  /**
   * 发送当前完整DOM内容给Host
   */
  private sendDOMContent(): void {
    const htmlContent = document.documentElement.outerHTML

    this.sendMessage({
      type: MessageType.DOM_CONTENT,
      payload: htmlContent,
    })
  }
}

// 导出单例实例
const previewMessageChannel = PreviewMessageChannel.getInstance()
export default previewMessageChannel
