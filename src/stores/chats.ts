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
import type { Chat, ChatFilter } from '@/types/chat'

export const useChatsStore = defineStore('chats', () => {
  // State
  const chatsByChannel = ref<Map<string, Chat[]>>(new Map())
  const activeChatId = ref<string | null>(null)
  const filters = ref<ChatFilter>({ type: 'all' })
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
    const chats = chatsByChannel.value.get(channelId) || []
    return applyFilters(chats, filters.value)
  })

  const unreadCount = computed(() => {
    let total = 0
    for (const chats of chatsByChannel.value.values()) {
      total += chats.reduce((sum, chat) => sum + chat.unreadCount, 0)
    }
    return total
  })

  // Actions
  function setActiveChat(chatId: string) {
    activeChatId.value = chatId
  }

  function setFilters(newFilters: Partial<ChatFilter>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  async function fetchChats(channelId: string) {
    // TODO: Implementar fetch de chats
    isLoading.value = true
    try {
      // Mock data por ahora
      chatsByChannel.value.set(channelId, [])
    } catch (err) {
      error.value = 'Error fetching chats'
    } finally {
      isLoading.value = false
    }
  }

  function applyFilters(chats: Chat[], filters: ChatFilter): Chat[] {
    // TODO: Implementar lógica de filtros
    return chats
  }

  return {
    // State
    chatsByChannel,
    activeChatId,
    filters,
    isLoading,
    error,
    // Getters
    activeChat,
    getChannelChats,
    unreadCount,
    // Actions
    setActiveChat,
    setFilters,
    fetchChats
  }
})