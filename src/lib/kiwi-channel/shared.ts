/**
 * 通信消息类型常量
 */
export class MessageType {
  // Preview发送给Host的消息类型
  static readonly DOM_LOADED = 'dom_loaded' // DOM加载完成事件
  static readonly DOM_CONTENT = 'dom_content' // 当前完整DOM内容

  // Host发送给Preview的消息类型
  static readonly REFRESH = 'refresh' // 刷新页面事件
  static readonly GET_DOM_CONTENT = 'get_dom_content' // 获取当前完整DOM内容的请求
}
