/**
 * WebSocket Service
 *
 * Servicio para manejo de conexiones WebSocket en tiempo real
 * - Auto-reconexión con backoff exponencial
 * - Ping-pong keep-alive
 * - Event emitter para notificaciones
 * - Queue de mensajes para offline
 */

import { config } from '@/config'
import type {
  WebSocketEvent,
  WebSocketStatus,
  WebSocketConfig,
  IWebSocketService,
  WebSocketEventCallback,
  WebSocketStatusCallback
} from '@/types/websocket'
import { WebSocketStatus as Status } from '@/types/websocket'

class WebSocketService implements IWebSocketService {
  private ws: WebSocket | null = null
  private status: WebSocketStatus = Status.DISCONNECTED
  private reconnectAttempt = 0
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private pingInterval: ReturnType<typeof setInterval> | null = null
  private eventListeners: Map<string, Function[]> = new Map()
  private messageQueue: string[] = []

  private readonly config: WebSocketConfig = {
    url: config.websocketUrl,
    reconnectAttempts: 5,
    reconnectDelay: 1000, // 1 second
    maxReconnectDelay: 30000, // 30 seconds
    pingInterval: 30000 // 30 seconds
  }

  constructor() {
    // Auto-connect on instantiation
    this.connect()
  }


  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return
    }

    this.setStatus(Status.CONNECTING)

    try {
      this.ws = new WebSocket(this.config.url)
      this.setupEventHandlers()
    } catch (error) {
      console.error('WebSocket connection error:', error)
      this.setStatus(Status.ERROR, `Connection failed: ${error}`)
      this.scheduleReconnect()
    }
  }

  public disconnect(): void {
    this.clearReconnectTimeout()
    this.clearPingInterval()

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect')
      this.ws = null
    }

    this.setStatus(Status.DISCONNECTED)
    this.reconnectAttempt = 0
  }

  public reconnect(): void {
    this.disconnect()
    this.connect()
  }

  public isConnected(): boolean {
    return this.status === Status.CONNECTED && this.ws?.readyState === WebSocket.OPEN
  }

  public getStatus(): WebSocketStatus {
    return this.status
  }

  public on(event: 'message', callback: WebSocketEventCallback): void
  public on(event: 'status', callback: WebSocketStatusCallback): void
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  public off(event: 'message', callback: WebSocketEventCallback): void
  public off(event: 'status', callback: WebSocketStatusCallback): void
  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index !== -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return

    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.setStatus(Status.CONNECTED)
      this.reconnectAttempt = 0
      this.startPingInterval()
      this.processMessageQueue()
    }

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason)
      this.clearPingInterval()

      if (event.code !== 1000) { // Not a normal close
        this.setStatus(Status.DISCONNECTED, `Connection closed: ${event.reason}`)
        this.scheduleReconnect()
      } else {
        this.setStatus(Status.DISCONNECTED)
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.setStatus(Status.ERROR, 'Connection error')
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }
  }

  private handleMessage(data: any): void {
    // Handle ping-pong
    if (data.type === 'ping') {
      this.sendPong()
      return
    }

    if (data.type === 'pong') {
      // Pong received, connection is alive
      return
    }

    // Handle application messages
    if (this.isValidWebSocketEvent(data)) {
      this.emit('message', data)
    } else {
      console.warn('Invalid WebSocket message format:', data)
    }
  }

  private isValidWebSocketEvent(data: any): data is WebSocketEvent {
    return data && typeof data === 'object' && 'type' in data
  }

  private sendPong(): void {
    if (this.isConnected()) {
      this.ws?.send(JSON.stringify({ type: 'pong' }))
    }
  }

  private startPingInterval(): void {
    this.clearPingInterval()
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.ws?.send(JSON.stringify({ type: 'ping' }))
      }
    }, this.config.pingInterval)
  }

  private clearPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempt >= this.config.reconnectAttempts) {
      console.log('Max reconnection attempts reached')
      this.setStatus(Status.ERROR, 'Max reconnection attempts reached')
      return
    }

    this.clearReconnectTimeout()
    this.setStatus(Status.RECONNECTING)

    // Exponential backoff with jitter
    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectAttempt),
      this.config.maxReconnectDelay
    )
    const jitter = Math.random() * 1000 // Add up to 1 second of jitter
    const totalDelay = delay + jitter

    console.log(`Reconnecting in ${Math.round(totalDelay)}ms (attempt ${this.reconnectAttempt + 1})`)

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempt++
      this.connect()
    }, totalDelay)
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift()!
      this.ws?.send(message)
    }
  }

  private setStatus(status: WebSocketStatus, error?: string): void {
    this.status = status
    this.emit('status', status, error)
  }

  private emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(...args)
        } catch (error) {
          console.error(`Error in WebSocket event listener for "${event}":`, error)
        }
      })
    }
  }

  // Cleanup method for when service is destroyed
  public destroy(): void {
    this.disconnect()
    this.eventListeners.clear()
    this.messageQueue.length = 0
  }
}

// Singleton instance
export const websocketService = new WebSocketService()
export { WebSocketService }