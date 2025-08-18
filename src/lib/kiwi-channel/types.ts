/**
 * 定义Host和Preview之间通信的共享类型
 */

/**
 * 通信消息类型枚举
 */
export enum MessageType {
  // Preview发送给Host的消息类型
  DOM_LOADED = 'dom_loaded',      // DOM加载完成事件
  DOM_CONTENT = 'dom_content',    // 当前完整DOM内容
  
  // Host发送给Preview的消息类型
  REFRESH = 'refresh',            // 刷新页面事件
  GET_DOM_CONTENT = 'get_dom_content', // 获取当前完整DOM内容的请求
}

/**
 * 通信消息的接口定义
 */
export interface IMessage {
  type: MessageType;  // 消息类型
  payload?: any;      // 消息负载
}