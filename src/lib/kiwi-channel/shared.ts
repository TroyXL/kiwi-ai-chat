/**
 * 通信消息类型常量
 */
export class MessageType {
  // Preview发送给Host的消息类型
  static readonly DOM_LOADED = 'dom_loaded' // DOM加载完成事件
  static readonly DOM_CONTENT = 'dom_content' // 当前完整DOM内容
  static readonly LOGS_CONTENT = 'logs_content' // 日志内容
  static readonly SCREENSHOT_CONTENT = 'screenshot_content' // 页面截图内容

  // Host发送给Preview的消息类型
  static readonly REFRESH = 'refresh' // 刷新页面事件
  static readonly GET_DOM_CONTENT = 'get_dom_content' // 获取当前完整DOM内容的请求
  static readonly GET_LOGS_CONTENT = 'get_logs_content' // 获取日志内容的请求
  static readonly GET_SCREENSHOT = 'get_screenshot' // 获取页面截图的请求
  static readonly GET_CHANNEL_SUPPORTED = 'get_channel_supported' // 获取通道支持状态的请求
  static readonly CHANNEL_SUPPORTED = 'channel_supported' // 通道支持状态
}
