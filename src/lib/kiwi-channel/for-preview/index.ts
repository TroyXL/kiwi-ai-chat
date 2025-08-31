/**
 * Preview端通信模块
 * 负责与Host进行通信
 */

import { MessageType } from '../shared'

declare global {
  interface Window {
    __kiwi__logs__catcher: ILogEvent[]
    __kiwi__original__console: {
      log: typeof console.log
      warn: typeof console.warn
      error: typeof console.error
    }
  }
}

console.log('Setup PreviewMessageChannel', window)

const __kiwi__channel__supported__ = true
const __kiwi__logs__catcher: ILogEvent[] = []
window.__kiwi__logs__catcher = __kiwi__logs__catcher

// 保存原始的 console 方法
window.__kiwi__original__console = {
  log: console.log,
  warn: console.warn,
  error: console.error,
}

/**
 * 将参数转换为可克隆的格式
 */
function makeCloneable(args: any[]): any[] {
  return args.map((arg: any) => {
    // 如果是 Error 对象，提取关键信息
    if (arg instanceof Error) {
      return {
        errorObject: true,
        name: arg.name,
        message: arg.message,
        stack: arg.stack,
      }
    }

    // 如果是普通对象，尝试克隆
    if (typeof arg === 'object' && arg !== null) {
      try {
        // 测试是否可以序列化
        JSON.parse(JSON.stringify(arg))
        return arg
      } catch {
        // 如果不可序列化，返回简单描述
        return '[Unknown object]'
      }
    }

    // 原始类型直接返回
    return arg
  })
}

// 重写 console.log
console.log = function (...args) {
  // 调用原始方法
  window.__kiwi__original__console.log.apply(console, args)
  // 记录日志，确保参数可克隆
  __kiwi__logs__catcher.push({
    type: 'console.log',
    args: makeCloneable(args),
    timestamp: Date.now(),
  })
}

// 重写 console.warn
console.warn = function (...args) {
  // 调用原始方法
  window.__kiwi__original__console.warn.apply(console, args)
  // 记录警告，确保参数可克隆
  __kiwi__logs__catcher.push({
    type: 'console.warn',
    args: makeCloneable(args),
    timestamp: Date.now(),
  })
}

// 重写 console.error
console.error = function (...args) {
  // 调用原始方法
  window.__kiwi__original__console.error.apply(console, args)
  // 记录错误，确保参数可克隆
  __kiwi__logs__catcher.push({
    type: 'console.error',
    args: makeCloneable(args),
    timestamp: Date.now(),
  })
}

// 捕获 JavaScript 错误
window.addEventListener('error', event => {
  // 创建一个可克隆的错误对象
  const cloneableError = event.error
    ? {
        name: event.error.name,
        message: event.error.message,
      }
    : undefined

  __kiwi__logs__catcher.push({
    type: 'error',
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: cloneableError as any, // 使用类型断言解决类型不匹配问题
    stack: event.error?.stack,
    timestamp: Date.now(),
  })
})

// 捕获未处理的 Promise 拒绝
window.addEventListener('unhandledrejection', event => {
  // 处理 reason，确保它是可克隆的
  let cloneableReason: any

  if (event.reason instanceof Error) {
    // 如果是 Error 对象，提取关键信息
    cloneableReason = {
      errorObject: true,
      name: event.reason.name,
      message: event.reason.message,
      stack: event.reason.stack,
    }
  } else if (typeof event.reason === 'object' && event.reason !== null) {
    // 如果是普通对象，尝试克隆
    try {
      // 测试是否可以序列化
      JSON.parse(JSON.stringify(event.reason))
      cloneableReason = event.reason
    } catch {
      // 如果不可序列化，返回简单描述
      cloneableReason = '[Unknown object]'
    }
  } else {
    // 原始类型直接使用
    cloneableReason = event.reason
  }

  __kiwi__logs__catcher.push({
    type: 'unhandledrejection',
    reason: cloneableReason,
    timestamp: Date.now(),
  })
})

/**
 * Preview端的消息通道类
 * 负责与Host进行通信
 */
class PreviewMessageChannel {
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
    const onDOMLoaded = () => {
      this.sendDOMLoaded()
    };

    console.log('Adding DOM init listener. ready state: ', document.readyState)

    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      onDOMLoaded();
    } else {
      window.addEventListener('DOMContentLoaded', onDOMLoaded);
    }
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

      case MessageType.GET_LOGS_CONTENT:
        // 处理获取日志内容的请求
        this.sendLogsContent()
        break

      case MessageType.GET_SCREENSHOT:
        // 处理获取页面截图的请求
        this.sendScreenshot()
        break
        
      case MessageType.GET_CHANNEL_SUPPORTED:
        // 处理获取通道支持状态的请求
        this.sendChannelSupported()
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

  private sendDOMLoaded(): void {
      this.sendMessage({
        type: MessageType.DOM_LOADED,
      });
  }

  /**
   * 发送日志内容给Host
   */
  private sendLogsContent(): void {
    // 由于我们已经在记录日志时处理了不可克隆的对象，可以直接发送日志数组
    this.sendMessage({
      type: MessageType.LOGS_CONTENT,
      payload: window.__kiwi__logs__catcher,
    })
  }
  
  /**
   * 发送通道支持状态给Host
   */
  private sendChannelSupported(): void {
    this.sendMessage({
      type: MessageType.CHANNEL_SUPPORTED,
      payload: __kiwi__channel__supported__,
    })
  }

  /**
   * 使用html2canvas获取页面截图并发送给Host
   */
  private async sendScreenshot(): Promise<void> {
    try {
      // 使用previewWindow.html2canvas获取当前页面的截图
      if (window.html2canvas) {
        const canvas = await window.html2canvas(document.documentElement, {
          allowTaint: true,
          useCORS: true,
          scale: window.devicePixelRatio || 1,
        })

        // 将canvas转换为blob数据
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(blob => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to convert canvas to blob'))
            }
          }, 'image/png')
        })

        // 创建一个FileReader来读取blob数据为ArrayBuffer
        const reader = new FileReader()
        reader.onload = () => {
          // 发送截图数据给Host
          const screenshotData: IScreenshotData = {
            buffer: reader.result as ArrayBuffer,
            type: 'image/png',
          }
          this.sendMessage({
            type: MessageType.SCREENSHOT_CONTENT,
            payload: screenshotData,
          })
        }
        reader.onerror = () => {
          throw new Error('Failed to read blob data')
        }
        reader.readAsArrayBuffer(blob)
      } else {
        console.error('html2canvas is not available in the preview window')
        this.sendMessage({
          type: MessageType.SCREENSHOT_CONTENT,
          payload: null,
        })
      }
    } catch (error) {
      console.error('Failed to capture screenshot:', error)
      this.sendMessage({
        type: MessageType.SCREENSHOT_CONTENT,
        payload: null,
      })
    }
  }

}



// 导出单例实例
const previewMessageChannel = PreviewMessageChannel.getInstance()
export default previewMessageChannel
