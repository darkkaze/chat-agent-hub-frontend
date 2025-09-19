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
import { messagesService } from '@/services/channels/messagesService'
import type { MessageResponse, MessagesFiltersParams, SendMessageRequest } from '@/types/channels'
import type { TypingUser } from '@/types/message'

export const useMessagesStore = defineStore('messages', () => {
  // State
  const messagesByChat = ref<Map<string, MessageResponse[]>>(new Map())
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
  async function fetchMessages(
    channelId: string,
    chatId: string,
    filters?: MessagesFiltersParams
  ): Promise<MessageResponse[]> {
    if (!channelId || !chatId) return []

    isLoading.value = true
    error.value = null

    try {
      const response = await messagesService.getChatMessages(channelId, chatId, filters)
      const messages = response.messages || []

      // Store messages in backend order (newest first for pagination)
      messagesByChat.value.set(chatId, messages)
      return messages
    } catch (err: any) {
      error.value = err.detail || err.message || 'Error al cargar los mensajes'
      console.error('Error fetching messages:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function sendMessage(
    channelId: string,
    chatId: string,
    messageData: SendMessageRequest
  ): Promise<MessageResponse | null> {
    if (!channelId || !chatId || !messageData.content.trim()) return null

    try {
      const newMessage = await messagesService.sendMessage(channelId, chatId, messageData)

      // Add to local store at beginning (newest first order)
      const messages = messagesByChat.value.get(chatId) || []
      messages.unshift(newMessage)
      messagesByChat.value.set(chatId, messages)

      return newMessage
    } catch (err: any) {
      error.value = err.detail || err.message || 'Error al enviar el mensaje'
      console.error('Error sending message:', err)
      return null
    }
  }

  async function refreshMessages(channelId: string, chatId: string): Promise<void> {
    if (!channelId || !chatId) return

    console.log(`Refreshing messages for chat: ${chatId}`)
    await fetchMessages(channelId, chatId, { limit: 50 })
  }

  function addNewMessage(message: MessageResponse): void {
    const messages = messagesByChat.value.get(message.chat_id) || []

    // Check if message already exists (avoid duplicates)
    const existingIndex = messages.findIndex(m => m.id === message.id)
    if (existingIndex === -1) {
      // Add at beginning (newest first order)
      messages.unshift(message)
      messagesByChat.value.set(message.chat_id, messages)
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
    refreshMessages,
    addNewMessage,
    setTyping
  }
})