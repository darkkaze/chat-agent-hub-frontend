/**
 * Messages Store
 * 
 * Maneja el estado de los mensajes
 * - Mensajes por chat
 * - Envío de mensajes
 * - Estados de entrega
 * - Indicadores de escritura
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Message, MessageInput, TypingUser } from '@/types/message'

export const useMessagesStore = defineStore('messages', () => {
  // State
  const messagesByChat = ref<Map<string, Message[]>>(new Map())
  const typingUsers = ref<Map<string, TypingUser[]>>(new Map())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getChatMessages = (chatId: string) => computed(() => 
    messagesByChat.value.get(chatId) || []
  )

  const getChatTypingUsers = (chatId: string) => computed(() =>
    typingUsers.value.get(chatId) || []
  )

  // Actions
  async function fetchMessages(chatId: string, page = 1, limit = 50) {
    // TODO: Implementar fetch de mensajes
    isLoading.value = true
    try {
      // Mock data por ahora
      if (!messagesByChat.value.has(chatId)) {
        messagesByChat.value.set(chatId, [])
      }
    } catch (err) {
      error.value = 'Error fetching messages'
    } finally {
      isLoading.value = false
    }
  }

  async function sendMessage(chatId: string, messageInput: MessageInput) {
    // TODO: Implementar envío de mensaje
    try {
      // Mock: agregar mensaje optimísticamente
      const message: Message = {
        id: `temp-${Date.now()}`,
        chatId,
        senderId: 'current-user', // TODO: obtener del user store
        content: { text: messageInput.text },
        type: 'text',
        status: 'sending',
        timestamp: new Date(),
        reactions: [],
        isEdited: false,
        isDeleted: false
      }

      const messages = messagesByChat.value.get(chatId) || []
      messages.push(message)
      messagesByChat.value.set(chatId, messages)
    } catch (err) {
      error.value = 'Error sending message'
    }
  }

  function setTyping(chatId: string, userId: string, name: string) {
    // TODO: Implementar indicador de escritura
    const users = typingUsers.value.get(chatId) || []
    const existingIndex = users.findIndex(u => u.userId === userId)
    
    if (existingIndex >= 0) {
      users[existingIndex].timestamp = new Date()
    } else {
      users.push({ userId, name, timestamp: new Date() })
    }
    
    typingUsers.value.set(chatId, users)
  }

  return {
    // State
    messagesByChat,
    typingUsers,
    isLoading,
    error,
    // Getters
    getChatMessages,
    getChatTypingUsers,
    // Actions
    fetchMessages,
    sendMessage,
    setTyping
  }
})