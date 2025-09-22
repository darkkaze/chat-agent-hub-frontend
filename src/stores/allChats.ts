/**
 * All Chats Store
 *
 * Store para manejar los chats unificados de todos los canales
 * - Lista unificada de chats con filtros
 * - Estado de selección de canales
 * - Integración con WebSocket para updates multi-canal
 * - Compatible con el store de chats existente
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { allChatsService } from '@/services/allChatsService'
import type {
  UnifiedChatResponse,
  UnifiedChatsFiltersParams,
  ChannelOption,
  UnifiedChatsState
} from '@/types/allChats'

export const useAllChatsStore = defineStore('allChats', () => {
  // State
  const chats = ref<UnifiedChatResponse[]>([])
  const availableChannels = ref<ChannelOption[]>([])
  const uiState = ref<UnifiedChatsState>({
    selectedChannelId: null, // null = "All channels"
    searchQuery: '',
    filters: {}
  })
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const error = ref<string | null>(null)
  const hasMore = ref(true)
  const currentOffset = ref(0)

  // Getters
  const filteredChats = computed(() => {
    let filtered = chats.value

    // Filter by search query
    if (uiState.value.searchQuery) {
      const query = uiState.value.searchQuery.toLowerCase()
      filtered = filtered.filter(chat =>
        chat.name.toLowerCase().includes(query) ||
        chat.last_message?.toLowerCase().includes(query) ||
        chat.external_id.toLowerCase().includes(query) ||
        chat.channel_name.toLowerCase().includes(query)
      )
    }

    return filtered
  })

  const selectedChannel = computed(() => {
    if (!uiState.value.selectedChannelId) return null
    return availableChannels.value.find(c => c.id === uiState.value.selectedChannelId) || null
  })

  const totalChatsCount = computed(() => chats.value.length)

  const unreadCount = computed(() => {
    // This would need to be implemented based on the chat structure
    // For now, return 0 as placeholder
    return 0
  })

  // Actions
  async function loadChannels(): Promise<void> {
    try {
      availableChannels.value = await allChatsService.getChannelOptions()
    } catch (err) {
      console.error('Error loading channels:', err)
      error.value = 'Error al cargar los canales'
    }
  }

  async function loadChats(append = false): Promise<void> {
    if (append) {
      isLoadingMore.value = true
    } else {
      isLoading.value = true
      currentOffset.value = 0
      chats.value = []
    }

    error.value = null

    try {
      const filters = allChatsService.buildChannelFilter(
        uiState.value.selectedChannelId,
        {
          limit: 50,
          offset: currentOffset.value,
          ...uiState.value.filters
        }
      )

      const response = await allChatsService.getAllChats(filters)

      if (append) {
        chats.value.push(...response.chats)
      } else {
        chats.value = response.chats
      }

      hasMore.value = response.has_more
      currentOffset.value += response.chats.length

    } catch (err: unknown) {
      const getErrorMessage = (error: unknown): string => {
        if (error instanceof Error) return error.message
        if (error && typeof error === 'object' && 'detail' in error) {
          return String((error as { detail: unknown }).detail)
        }
        return 'Error al cargar las conversaciones'
      }

      error.value = getErrorMessage(err)
      console.error('Error loading all chats:', err)
    } finally {
      isLoading.value = false
      isLoadingMore.value = false
    }
  }

  async function refreshChats(): Promise<void> {
    await loadChats(false)
  }

  function setSelectedChannel(channelId: string | null): void {
    uiState.value.selectedChannelId = channelId
    // Reset offset when changing channel
    currentOffset.value = 0
    hasMore.value = true
  }

  function setSearchQuery(query: string): void {
    uiState.value.searchQuery = query
  }

  function setFilters(filters: Partial<UnifiedChatsFiltersParams>): void {
    uiState.value.filters = { ...uiState.value.filters, ...filters }
    // Reset offset when changing filters
    currentOffset.value = 0
    hasMore.value = true
  }

  function updateChatFromWebSocket(chatData: UnifiedChatResponse): void {
    const existingIndex = chats.value.findIndex(chat => chat.id === chatData.id)

    if (existingIndex >= 0) {
      // Update existing chat
      chats.value[existingIndex] = chatData
    } else {
      // Add new chat at the beginning
      chats.value.unshift(chatData)
    }
  }

  function removeChatFromWebSocket(chatId: string): void {
    const index = chats.value.findIndex(chat => chat.id === chatId)
    if (index >= 0) {
      chats.value.splice(index, 1)
    }
  }

  // Helper to get chat by ID
  function getChatById(chatId: string): UnifiedChatResponse | null {
    return chats.value.find(chat => chat.id === chatId) || null
  }

  // Initialize store
  async function initialize(): Promise<void> {
    await loadChannels()
    await loadChats()
  }

  return {
    // State
    chats,
    availableChannels,
    uiState,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    currentOffset,
    // Getters
    filteredChats,
    selectedChannel,
    totalChatsCount,
    unreadCount,
    // Actions
    loadChannels,
    loadChats,
    refreshChats,
    setSelectedChannel,
    setSearchQuery,
    setFilters,
    updateChatFromWebSocket,
    removeChatFromWebSocket,
    getChatById,
    initialize
  }
})