/**
 * 定义Host和Preview之间通信的共享类型
 */

/**
 * 为html2canvas添加全局声明
 */
interface Window {
  html2canvas?: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>
}

/**
 * 消息类型的类型定义
 */
type MessageTypeValues = (typeof MessageType)[keyof typeof MessageType]

/**
 * 截图数据的接口定义
 */
interface IScreenshotData {
  buffer: ArrayBuffer // 截图的二进制数据
  type: string // 图片类型，如'image/png'
}

/**
 * 通信消息的接口定义
 */
interface IMessage {
  type: MessageTypeValues // 消息类型
  payload?: any // 消息负载
}

/**
 * 日志事件的接口定义
 */
type ILogEvent =
  | {
      type: 'error'
      message: string // 错误消息
      filename: string // 错误发生的文件名
      lineno: number // 错误发生的行号
      colno: number // 错误发生的列号
      error: Error // 错误对象
      stack: string // 错误栈信息
      timestamp: number // 错误发生的时间戳
    }
  | {
      type: 'unhandledrejection'
      reason: any // 未处理的拒绝原因
      timestamp: number // 错误发生的时间戳
    }
  | {
      type: 'console.log'
      args: any[] // 日志参数
      timestamp: number // 日志时间戳
    }
  | {
      type: 'console.warn'
      args: any[] // 警告参数
      timestamp: number // 警告时间戳
    }
  | {
      type: 'console.error'
      args: any[] // 错误参数
      timestamp: number // 错误时间戳
    }
