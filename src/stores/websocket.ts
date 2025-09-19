/**
 * WebSocket Store
 *
 * Maneja el estado de la conexión WebSocket y eventos
 * - Estado de conexión (connected, disconnected, etc.)
 * - Eventos recibidos en tiempo real
 * - Integración con otros stores para auto-refresh
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { websocketService } from '@/services/websocket/websocketService'
import { useNotificationsStore } from '@/stores/notifications'
import { visibilityService } from '@/services/browser/visibilityService'
import type {
  WebSocketState,
  WebSocketEvent,
  NewMessageEvent,
  WebSocketStatus
} from '@/types/websocket'
import { WebSocketStatus as Status } from '@/types/websocket'

export const useWebSocketStore = defineStore('websocket', () => {
  // State
  const connection = ref({
    status: Status.DISCONNECTED,
    lastConnected: undefined,
    lastDisconnected: undefined,
    reconnectAttempt: 0,
    error: undefined
  })

  const lastEvent = ref<WebSocketEvent | undefined>(undefined)
  const lastEventTime = ref<Date | undefined>(undefined)
  const isInitialized = ref(false)

  // Getters
  const isConnected = computed(() => connection.value.status === Status.CONNECTED)
  const isConnecting = computed(() => connection.value.status === Status.CONNECTING)
  const isReconnecting = computed(() => connection.value.status === Status.RECONNECTING)
  const hasError = computed(() => connection.value.status === Status.ERROR)

  const connectionStatusText = computed(() => {
    switch (connection.value.status) {
      case Status.CONNECTED:
        return 'Conectado'
      case Status.CONNECTING:
        return 'Conectando...'
      case Status.RECONNECTING:
        return 'Reconectando...'
      case Status.DISCONNECTED:
        return 'Desconectado'
      case Status.ERROR:
        return 'Error de conexión'
      default:
        return 'Desconocido'
    }
  })

  // Event handlers
  const eventHandlers = ref(new Map<string, Function[]>())

  // Actions
  function initialize() {
    if (isInitialized.value) return

    // Initialize notifications store for audio notifications
    const notificationsStore = useNotificationsStore()
    notificationsStore.initialize()

    // Listen to WebSocket service events
    websocketService.on('status', handleStatusChange)
    websocketService.on('message', handleMessage)

    isInitialized.value = true
  }

  function destroy() {
    if (!isInitialized.value) return

    websocketService.off('status', handleStatusChange)
    websocketService.off('message', handleMessage)
    eventHandlers.value.clear()

    isInitialized.value = false
  }

  function connect() {
    websocketService.connect()
  }

  function disconnect() {
    websocketService.disconnect()
  }

  function reconnect() {
    websocketService.reconnect()
  }

  // Event listener management
  function on<T extends WebSocketEvent>(eventType: T['type'], callback: (event: T) => void): void {
    const key = eventType
    if (!eventHandlers.value.has(key)) {
      eventHandlers.value.set(key, [])
    }
    eventHandlers.value.get(key)!.push(callback)
  }

  function off<T extends WebSocketEvent>(eventType: T['type'], callback: (event: T) => void): void {
    const handlers = eventHandlers.value.get(eventType)
    if (handlers) {
      const index = handlers.indexOf(callback as Function)
      if (index !== -1) {
        handlers.splice(index, 1)
      }
    }
  }

  // Internal event handlers
  function handleStatusChange(status: WebSocketStatus, error?: string) {
    const now = new Date()

    connection.value = {
      ...connection.value,
      status,
      error,
      lastConnected: status === Status.CONNECTED ? now : connection.value.lastConnected,
      lastDisconnected: status === Status.DISCONNECTED ? now : connection.value.lastDisconnected
    }

    // Log connection changes
    console.log(`WebSocket status changed to: ${status}`, error ? { error } : '')
  }

  // Play notification sound for new message events
  function playNotificationForNewMessage(event: NewMessageEvent) {
    try {
      // Get current route to check if user is in the same chat
      const currentPath = window.location.pathname
      const isInSameChat = currentPath.includes(`/chat/${event.chat_id}`)

      // Check if browser/tab is currently visible
      const isPageVisible = visibilityService.getIsVisible()

      // Play notification if:
      // 1. User is NOT in the same chat, OR
      // 2. Page is NOT visible (user is in another tab/app)
      const shouldPlayNotification = !isInSameChat || !isPageVisible

      if (shouldPlayNotification) {
        const notificationsStore = useNotificationsStore()

        // Initialize notifications store if not already done
        if (!notificationsStore.isInitialized) {
          notificationsStore.initialize()
        }

        // Try to play notification sound
        notificationsStore.playNotificationSound()
          .then(success => {
            if (success) {
              const reason = !isInSameChat ? 'different chat' : 'page not visible'
              console.log(`Notification sound played for new message (${reason})`)
            } else {
              console.log('Notification sound not played - disabled or no permission')
            }
          })
          .catch(error => {
            console.error('Error playing notification sound:', error)
          })
      } else {
        console.log('Notification sound skipped - user is in the active chat and page is visible')
      }
    } catch (error) {
      console.error('Error in playNotificationForNewMessage:', error)
    }
  }

  function handleMessage(event: WebSocketEvent) {
    lastEvent.value = event
    lastEventTime.value = new Date()

    // Play notification sound for new messages
    if (event.type === 'new_message') {
      playNotificationForNewMessage(event as NewMessageEvent)
    }

    // Emit to registered event handlers
    const handlers = eventHandlers.value.get(event.type)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event)
        } catch (error) {
          console.error(`Error in WebSocket event handler for "${event.type}":`, error)
        }
      })
    }

    // Log received events
    console.log('WebSocket event received:', event.type, event)
  }

  // Convenience methods for specific event types
  function onNewMessage(callback: (event: NewMessageEvent) => void): void {
    on('new_message', callback)
  }

  function offNewMessage(callback: (event: NewMessageEvent) => void): void {
    off('new_message', callback)
  }

  // Get connection statistics
  const getConnectionStats = computed(() => ({
    status: connection.value.status,
    isConnected: isConnected.value,
    lastConnected: connection.value.lastConnected,
    lastDisconnected: connection.value.lastDisconnected,
    lastEvent: lastEvent.value,
    lastEventTime: lastEventTime.value,
    error: connection.value.error
  }))

  return {
    // State
    connection: computed(() => connection.value),
    lastEvent: computed(() => lastEvent.value),
    lastEventTime: computed(() => lastEventTime.value),
    isInitialized: computed(() => isInitialized.value),

    // Getters
    isConnected,
    isConnecting,
    isReconnecting,
    hasError,
    connectionStatusText,
    getConnectionStats,

    // Actions
    initialize,
    destroy,
    connect,
    disconnect,
    reconnect,

    // Event management
    on,
    off,
    onNewMessage,
    offNewMessage
  }
})