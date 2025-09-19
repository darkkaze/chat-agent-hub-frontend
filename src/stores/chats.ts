/**
 * Chats Store
 * 
 * Maneja el estado de las conversaciones
 * - Lista de chats por canal
 * - Chat actualmente seleccionado
 * - Filtros y búsqueda
 * - Estados de carga
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { chatsService } from '@/services/channels/chatsService'
import type { ChatResponse, ChatFiltersParams } from '@/types/channels'

export const useChatsStore = defineStore('chats', () => {
  // State
  const chatsByChannel = ref<Map<string, ChatResponse[]>>(new Map())
  const activeChatId = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeChat = computed(() => {
    if (!activeChatId.value) return null
    for (const chats of chatsByChannel.value.values()) {
      const chat = chats.find(c => c.id === activeChatId.value)
      if (chat) return chat
    }
    return null
  })

  const getChannelChats = (channelId: string) => computed(() => {
    return chatsByChannel.value.get(channelId) || []
  })

  const unreadCount = computed(() => {
    let total = 0
    for (const chats of chatsByChannel.value.values()) {
      total += chats.reduce((sum, chat) => sum + chat.unread_count, 0)
    }
    return total
  })

  // Actions
  function setActiveChat(chatId: string) {
    activeChatId.value = chatId
  }

  async function fetchChats(channelId: string, filters?: ChatFiltersParams): Promise<ChatResponse[]> {
    if (!channelId) return []

    isLoading.value = true
    error.value = null

    try {
      const response = await chatsService.getChannelChats(channelId, filters)
      const chats = response.chats || []
      chatsByChannel.value.set(channelId, chats)
      return chats
    } catch (err: any) {
      error.value = err.detail || err.message || 'Error al cargar los chats'
      console.error('Error fetching chats:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function refreshChats(channelId: string): Promise<void> {
    if (!channelId) return

    console.log(`Refreshing chats for channel: ${channelId}`)
    await fetchChats(channelId, { limit: 100 })
  }

  function updateChatFromWebSocket(channelId: string, chatId: string): void {
    // Simple approach: refresh the entire channel's chats
    // In a more optimized version, we could update just the specific chat
    refreshChats(channelId)
  }

  return {
    // State
    chatsByChannel,
    activeChatId,
    isLoading,
    error,
    // Getters
    activeChat,
    getChannelChats,
    unreadCount,
    // Actions
    setActiveChat,
    fetchChats,
    refreshChats,
    updateChatFromWebSocket
  }
})