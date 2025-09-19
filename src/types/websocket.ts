/**
 * WebSocket Types
 *
 * Types para comunicación WebSocket en tiempo real
 * - Eventos de mensajes nuevos
 * - Estados de conexión
 * - Manejo de reconexión
 */

import type { SenderType, MessageType } from './api'

// WebSocket connection states
export enum WebSocketStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// WebSocket message types from backend
export interface NewMessageEvent {
  type: 'new_message'
  chat_id: string
  channel_id: string
  message_id: string
  sender_type: SenderType
  timestamp: string
  message_type: MessageType
  preview: string
  external_id: string
  chat_name: string
  chat_external_id: string
}

// Union type for all possible WebSocket events
export type WebSocketEvent = NewMessageEvent

// WebSocket service configuration
export interface WebSocketConfig {
  url: string
  reconnectAttempts: number
  reconnectDelay: number
  maxReconnectDelay: number
  pingInterval: number
}

// WebSocket connection info
export interface WebSocketConnection {
  status: WebSocketStatus
  lastConnected?: Date
  lastDisconnected?: Date
  reconnectAttempt: number
  error?: string
}

// Event listener callback types
export type WebSocketEventCallback<T = WebSocketEvent> = (event: T) => void
export type WebSocketStatusCallback = (status: WebSocketStatus, error?: string) => void

// WebSocket service interface
export interface IWebSocketService {
  connect(): void
  disconnect(): void
  reconnect(): void
  isConnected(): boolean
  getStatus(): WebSocketStatus
  on(event: 'message', callback: WebSocketEventCallback): void
  on(event: 'status', callback: WebSocketStatusCallback): void
  off(event: 'message', callback: WebSocketEventCallback): void
  off(event: 'status', callback: WebSocketStatusCallback): void
}

// WebSocket store state
export interface WebSocketState {
  connection: WebSocketConnection
  lastEvent?: WebSocketEvent
  lastEventTime?: Date
}