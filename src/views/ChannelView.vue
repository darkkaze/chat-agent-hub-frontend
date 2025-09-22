<!--
ChannelView Component

Vista principal que muestra la lista de chats de un canal específico.
Incluye:
- Header del canal con título y acciones
- Buscador de chats
- Filtros (todos, no leídos, archivados)
- Lista de chats con preview del último mensaje
- Estado vacío cuando no hay chats

Ruta: /channel/:channelId
Props: channelId viene del router
Emits: @chat-selected cuando se selecciona un chat
-->

<template>
  <div class="channel-view d-flex flex-column h-100">

    <!-- Channel Selector (always visible) -->
    <div class="px-4 py-3 border-b">
      <ChannelSelector
        v-model="selectedChannelId"
        :channels="availableChannels"
      />
    </div>

    <!-- Search -->
    <div class="px-4 py-3 border-b">
      <v-text-field
        v-model="searchQuery"
        placeholder="Buscar conversaciones"
        variant="outlined"
        density="compact"
        prepend-inner-icon="mdi-magnify"
        clearable
        hide-details
        @input="handleSearch"
      />
    </div>


    <!-- Chat List -->
    <div class="chat-list flex-1-1 overflow-y-auto">
      <!-- Loading state -->
      <div v-if="displayIsLoading" class="d-flex justify-center pa-8">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <!-- Error state -->
      <div v-else-if="displayError" class="pa-4">
        <v-alert type="error" variant="tonal">
          {{ displayError }}
        </v-alert>
      </div>

      <!-- Empty state -->
      <div 
        v-else-if="filteredChats.length === 0 && !displayIsLoading"
        class="empty-state pa-6 text-center"
      >
        <v-icon size="48" color="on-surface-variant" class="mb-3">
          mdi-chat-outline
        </v-icon>
        <h4 class="text-subtitle-1 text-on-surface-variant mb-2">
          {{ searchQuery ? 'No se encontraron conversaciones' : 'No hay conversaciones' }}
        </h4>
        <p class="text-body-2 text-on-surface-variant">
          {{ searchQuery 
            ? 'Intenta con otros términos de búsqueda' 
            : 'Las nuevas conversaciones aparecerán aquí'
          }}
        </p>
      </div>

      <!-- Chat items -->
      <div v-else>
        <ChatListItem
          v-for="chat in filteredChats"
          :key="chat.id"
          :chat="normalizeChat(chat)"
          :is-selected="selectedChatId === chat.id"
          @click="selectChat(chat)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatsStore } from '@/stores/chats'
import { useAllChatsStore } from '@/stores/allChats'
import { useWebSocketStore } from '@/stores/websocket'
import { channelsService } from '@/services/channels/channelsService'
import ChatListItem from '@/components/chat/ChatListItem.vue'
import ChannelSelector from '@/components/chat/ChannelSelector.vue'
import type { ChatResponse } from '@/types/channels'
import type { NewMessageEvent } from '@/types/websocket'
import type { UnifiedChatResponse } from '@/types/allChats'

// Internal view mode state (decoupled from URL)
const viewMode = ref<'all' | 'specific'>('specific')

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const chatsStore = useChatsStore()
const allChatsStore = useAllChatsStore()
const websocketStore = useWebSocketStore()

// Reactive data - back to original local state
const chats = ref<ChatResponse[]>([])
const isLoading = ref(false)
const error = ref('')
const searchQuery = ref('')
const channelName = ref('')
const selectedChatId = computed(() => route.params.chatId as string | undefined)

// Channel selector state (decoupled from URL)
const selectedChannelId = computed({
  get: () => {
    if (viewMode.value === 'all') {
      return null // "Todos los canales"
    } else {
      return route.params.channelId as string || null
    }
  },
  set: (value) => {
    if (value === null) {
      // User selected "Todos los canales" - navigate to /chats
      router.push('/chats')
    } else {
      // User selected a specific channel - navigate to that channel
      router.push(`/channel/${value}`)
    }
  }
})

const availableChannels = computed(() => {
  // Always show all available channels (so user can switch)
  return allChatsStore.availableChannels
})

// Display data based on view mode (decoupled from URL)
const displayChats = computed(() => {
  if (viewMode.value === 'all') {
    return allChatsStore.filteredChats
  } else {
    return chats.value
  }
})

const displayIsLoading = computed(() => {
  if (viewMode.value === 'all') {
    return allChatsStore.isLoading
  } else {
    return isLoading.value
  }
})

const displayError = computed(() => {
  if (viewMode.value === 'all') {
    return allChatsStore.error
  } else {
    return error.value
  }
})

// Type guards
const isUnifiedChat = (chat: unknown): chat is UnifiedChatResponse => {
  return typeof chat === 'object' && chat !== null && 'channel_id' in chat && 'channel_name' in chat
}

const isChatResponse = (chat: unknown): chat is ChatResponse => {
  return typeof chat === 'object' && chat !== null && 'unread_count' in chat && 'is_assigned' in chat
}

// Convert UnifiedChatResponse to ChatResponse format for compatibility
const normalizeChat = (chat: ChatResponse | UnifiedChatResponse): ChatResponse => {
  if (isChatResponse(chat)) {
    return chat
  }

  // Convert UnifiedChatResponse to ChatResponse format
  return {
    id: chat.id,
    name: chat.name,
    external_id: chat.external_id,
    customer_name: chat.name, // Use name as customer_name fallback
    customer_phone: '', // UnifiedChatResponse doesn't have this
    assigned_user_id: chat.assigned_user_id || undefined,
    assigned_user_name: undefined, // UnifiedChatResponse doesn't have this
    last_message: chat.last_message || undefined,
    last_message_at: chat.last_message_ts || new Date().toISOString(),
    unread_count: 0, // UnifiedChatResponse doesn't have this
    is_assigned: chat.assigned_user_id !== null,
    extra_data: chat.extra_data || {},
    created_at: chat.created_at,
    updated_at: chat.updated_at
  }
}

// Computed

const filteredChats = computed(() => {
  // Use displayChats which already handles the showAllChats logic
  const sourceChats = displayChats.value

  if (!sourceChats || !Array.isArray(sourceChats)) {
    return []
  }

  // For viewMode 'all', the store already handles filtering
  if (viewMode.value === 'all') {
    return sourceChats
  }

  // For normal channel mode, apply local filtering
  let filtered = [...sourceChats]

  // Apply text search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(chat => {
      const name = chat.name?.toLowerCase() || ''
      const message = chat.last_message?.toLowerCase() || ''

      if (isChatResponse(chat)) {
        // ChatResponse has customer_name and customer_phone
        const customerName = chat.customer_name?.toLowerCase() || ''
        const customerPhone = chat.customer_phone || ''
        return name.includes(query) || customerName.includes(query) ||
               customerPhone.includes(query) || message.includes(query)
      } else {
        // UnifiedChatResponse only has basic fields
        return name.includes(query) || message.includes(query)
      }
    })
  }

  return filtered
})

// Methods
const loadChats = async () => {
  const channelId = route.params.channelId as string
  if (!channelId) return

  try {
    const loadedChats = await chatsStore.fetchChats(channelId, { limit: 100 })
    chats.value = loadedChats
  } catch (err: unknown) {
    const getErrorMessage = (error: unknown): string => {
      if (error instanceof Error) return error.message
      if (error && typeof error === 'object' && 'detail' in error) {
        return String((error as { detail: unknown }).detail)
      }
      return 'Error al cargar las conversaciones'
    }

    error.value = getErrorMessage(err)
    console.error('Error loading chats:', err)
    chats.value = []
  }
}

const loadChannelInfo = async () => {
  const channelId = route.params.channelId as string
  if (!channelId) return

  try {
    const channel = await channelsService.getChannel(channelId)
    channelName.value = channel.name
  } catch (err) {
    console.error('Error loading channel info:', err)
    channelName.value = `Canal ${channelId}`
  }
}

const selectChat = (chat: ChatResponse | UnifiedChatResponse) => {
  if (viewMode.value === 'all') {
    // In unified view, navigate to proper channel but keep "Todos" selection
    const chatChannelId = isUnifiedChat(chat) ? chat.channel_id : route.params.channelId as string
    router.push(`/channel/${chatChannelId}/chat/${chat.id}?viewMode=all`)
  } else {
    // In channel view, use channel-specific URL
    const channelId = route.params.channelId as string
    router.push(`/channel/${channelId}/chat/${chat.id}`)
  }
}

const handleSearch = () => {
  // For viewMode 'all', sync local search with store
  if (viewMode.value === 'all') {
    allChatsStore.setSearchQuery(searchQuery.value)
  }
  // For channel mode, search is handled by filteredChats computed
}


// WebSocket event handlers
const handleNewMessage = (event: NewMessageEvent) => {
  const currentChannelId = route.params.channelId as string

  // Only refresh if the message is for the current channel
  if (event.channel_id === currentChannelId) {
    console.log(`New message received for channel ${currentChannelId}, refreshing chats`)
    chatsStore.refreshChats(currentChannelId)
      .then(() => {
        // Update local chats from store
        const channelChats = chatsStore.getChannelChats(currentChannelId).value
        chats.value = channelChats
      })
      .catch(err => {
        console.error('Error refreshing chats after WebSocket event:', err)
      })
  }
}

// Watchers
watch(
  () => route.params.channelId,
  (newChannelId) => {
    if (newChannelId) {
      loadChats()
      loadChannelInfo()
    }
  }
)

// Watch for viewMode changes in query parameters
watch(
  () => route.query.viewMode,
  (newViewMode) => {
    if (newViewMode === 'all') {
      viewMode.value = 'all'
    } else if (route.path.startsWith('/channel/')) {
      viewMode.value = 'specific'
    }
  }
)

// Lifecycle
onMounted(async () => {
  // Check if we should start in 'all' view mode
  if (route.query.viewMode === 'all' || route.path.startsWith('/chats')) {
    viewMode.value = 'all'
  }

  // Always initialize channel-specific logic first
  const channelId = route.params.channelId as string
  if (channelId) {
    authStore.setLastVisitedChannel(channelId)
    loadChats()
    loadChannelInfo()
  }

  // Always load available channels for the selector
  await allChatsStore.loadChannels()

  // Initialize all chats store for unified view capabilities
  await allChatsStore.initialize()

  // Initialize WebSocket and listen for new messages
  websocketStore.initialize()
  websocketStore.onNewMessage(handleNewMessage)
})

onUnmounted(() => {
  // Clean up WebSocket listeners
  websocketStore.offNewMessage(handleNewMessage)
})
</script>

<style scoped>
.channel-view {
  height: 100vh;
  background: rgb(var(--v-theme-surface));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.border-b {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  flex-shrink: 0;
}

.chat-list {
  background: rgb(var(--v-theme-surface));
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.empty-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Custom scrollbar for chat list */
.chat-list::-webkit-scrollbar {
  width: 6px;
}

.chat-list::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-on-surface), 0.05);
}

.chat-list::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 3px;
}

.chat-list::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-on-surface), 0.3);
}
</style>