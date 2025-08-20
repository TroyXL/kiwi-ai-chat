/**
 * 定义Host和Preview之间通信的共享类型
 */

/**
 * 消息类型的类型定义
 */
type MessageTypeValues = (typeof MessageType)[keyof typeof MessageType]

/**
 * 通信消息的接口定义
 */
interface IMessage {
  type: MessageTypeValues // 消息类型
  payload?: any // 消息负载
}
