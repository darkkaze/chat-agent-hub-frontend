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

    <!-- Filters -->
    <div class="px-4 py-2 border-b">
      <v-chip-group
        v-model="selectedFilter"
        color="primary"
        variant="outlined"
        density="compact"
        @update:model-value="handleFilterChange"
      >
        <v-chip value="all" size="small">Todos</v-chip>
        <v-chip value="unread" size="small">
          No leídos
          <v-badge
            v-if="unreadCount > 0"
            :content="unreadCount"
            color="error"
            inline
            class="ml-1"
          />
        </v-chip>
        <v-chip value="assigned" size="small">Asignados</v-chip>
      </v-chip-group>
    </div>

    <!-- Chat List -->
    <div class="chat-list flex-1-1 overflow-y-auto">
      <!-- Loading state -->
      <div v-if="isLoading" class="d-flex justify-center pa-8">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="pa-4">
        <v-alert type="error" variant="tonal">
          {{ error }}
        </v-alert>
      </div>

      <!-- Empty state -->
      <div 
        v-else-if="filteredChats.length === 0 && !isLoading"
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
          :chat="chat"
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
import { useWebSocketStore } from '@/stores/websocket'
import { chatsService } from '@/services/channels/chatsService'
import { channelsService } from '@/services/channels/channelsService'
import ChatListItem from '@/components/chat/ChatListItem.vue'
import type { ChatResponse, ChatFiltersParams } from '@/types/channels'
import type { NewMessageEvent } from '@/types/websocket'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const chatsStore = useChatsStore()
const websocketStore = useWebSocketStore()

// Reactive data
const chats = ref<ChatResponse[]>([])
const isLoading = ref(false)
const error = ref('')
const searchQuery = ref('')
const selectedFilter = ref('all')
const channelName = ref('')
const selectedChatId = computed(() => route.params.chatId as string | undefined)

// Computed
const unreadCount = computed(() => 
  chats.value?.filter(chat => chat.unread_count > 0).length || 0
)

const filteredChats = computed(() => {
  if (!chats.value || !Array.isArray(chats.value)) {
    return []
  }
  
  let filtered = [...chats.value]

  // Apply text search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(chat => 
      chat.name?.toLowerCase().includes(query) ||
      chat.customer_name?.toLowerCase().includes(query) ||
      chat.customer_phone?.includes(query) ||
      chat.last_message?.toLowerCase().includes(query)
    )
  }

  // Apply filters
  switch (selectedFilter.value) {
    case 'unread':
      filtered = filtered.filter(chat => chat.unread_count > 0)
      break
    case 'assigned':
      filtered = filtered.filter(chat => chat.is_assigned)
      break
    default:
      // 'all' - no additional filtering
      break
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
  } catch (err: any) {
    error.value = err.detail || 'Error al cargar las conversaciones'
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

const selectChat = (chat: ChatResponse) => {
  const channelId = route.params.channelId as string
  router.push(`/channel/${channelId}/chat/${chat.id}`)
}

const handleSearch = () => {
  // Search is reactive through computed property
}

const handleFilterChange = () => {
  // Filter is reactive through computed property
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

// Lifecycle
onMounted(() => {
  const channelId = route.params.channelId as string
  if (channelId) {
    authStore.setLastVisitedChannel(channelId)
    loadChats()
    loadChannelInfo()
  }

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
  height: 100%;
  background: rgb(var(--v-theme-surface));
}

.border-b {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.chat-list {
  background: rgb(var(--v-theme-surface));
}

.empty-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>