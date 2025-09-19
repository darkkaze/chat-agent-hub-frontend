<!--
ChatView Component

Vista de conversación individual que muestra:
- Header con info del contacto y botones de acción
- Lista de mensajes con scroll infinito
- Indicador de "escribiendo"
- Input para enviar mensajes con attachments
- Estados de entrega/lectura de mensajes

Ruta: /channel/:channelId/chat/:chatId
Props: channelId y chatId vienen del router
Emits: @message-sent, @details-toggle
-->

<template>
  <div class="chat-view d-flex flex-column h-100" :class="{ 'panel-open': showDetailsPanel }">
    <!-- Chat Header -->
    <div class="chat-header px-4 py-3 border-b d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <!-- Back button (mobile) -->
        <v-btn 
          icon="mdi-arrow-left" 
          variant="text" 
          size="small"
          class="mr-2 d-sm-none"
          @click="goBack"
        />
        
        <!-- Avatar -->
        <v-avatar size="40" color="primary" class="mr-3">
          <v-icon v-if="!avatarText" color="white">mdi-account</v-icon>
          <span v-else class="text-subtitle-1 font-weight-bold">{{ avatarText }}</span>
        </v-avatar>
        
        <!-- Chat info -->
        <div>
          <h3 class="text-subtitle-1 font-weight-medium mb-0">
            {{ displayName }}
          </h3>
          <p class="text-caption text-on-surface-variant mb-0">
            {{ chatStatus }}
          </p>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="d-flex align-center">
        <v-btn
          icon="mdi-dots-vertical"
          variant="text"
          size="small"
          @click="toggleDetails"
        />
      </div>
    </div>

    <!-- Messages Area -->
    <div 
      ref="messagesContainer"
      class="messages-container flex-1-1 overflow-y-auto pa-4"
      @scroll="handleScroll"
    >
      <!-- Loading older messages -->
      <div v-if="isLoadingMore" class="text-center py-4">
        <v-progress-circular size="20" indeterminate color="primary" />
      </div>

      <!-- Error loading messages -->
      <div v-if="error" class="pa-4">
        <v-alert type="error" variant="tonal">
          {{ error }}
        </v-alert>
      </div>

      <!-- Messages -->
      <div v-if="messages && messages.length > 0" class="messages-list">
        <MessageBubble
          v-for="message in displayMessages"
          :key="message.id"
          :message="message"
          class="mb-2"
        />
      </div>

      <!-- Empty state -->
      <div v-else-if="!isLoading && !error && (!messages || messages.length === 0)" class="empty-chat pa-8 text-center">
        <v-icon size="48" color="on-surface-variant" class="mb-4">
          mdi-message-outline
        </v-icon>
        <h4 class="text-h6 text-on-surface-variant mb-2">
          Inicio de la conversación
        </h4>
        <p class="text-body-2 text-on-surface-variant">
          Los mensajes aparecerán aquí
        </p>
      </div>

      <!-- Typing indicator -->
      <div v-if="showTyping" class="typing-indicator pa-2">
        <div class="typing-bubble">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <div class="message-input-container border-t">
      <MessageInput
        :disabled="isSending"
        @send="sendMessage"
        @typing="handleTyping"
      />
    </div>

    <!-- Loading overlay -->
    <v-overlay
      v-model="isLoading"
      class="align-center justify-center"
      contained
    >
      <v-progress-circular indeterminate color="primary" size="64" />
    </v-overlay>

    <!-- Chat Details Panel -->
    <ChatDetailsPanel
      :chat="chat"
      :visible="showDetailsPanel"
      :channel-id="route.params.channelId as string"
      :chat-id="route.params.chatId as string"
      @close="closeDetailsPanel"
      @update:visible="showDetailsPanel = $event"
      @assign-user="handleAssignUser"
      @mark-read="handleMarkRead"
      @agent-updated="handleAgentUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatsStore } from '@/stores/chats'
import { useMessagesStore } from '@/stores/messages'
import { useWebSocketStore } from '@/stores/websocket'
import { chatsService } from '@/services/channels/chatsService'
import { messagesService } from '@/services/channels/messagesService'
import MessageBubble from '@/components/conversation/MessageBubble.vue'
import MessageInput from '@/components/conversation/MessageInput.vue'
import ChatDetailsPanel from '@/components/chat/ChatDetailsPanel.vue'
import type { ChatResponse, MessageResponse, SendMessageRequest, MessagesFiltersParams } from '@/types/channels'
import type { NewMessageEvent } from '@/types/websocket'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const chatsStore = useChatsStore()
const messagesStore = useMessagesStore()
const websocketStore = useWebSocketStore()

// Refs
const messagesContainer = ref<HTMLElement>()

// Reactive data
const chat = ref<ChatResponse | null>(null)
const messages = ref<MessageResponse[]>([])
const isLoading = ref(false)
const isLoadingMore = ref(false)
const isSending = ref(false)
const error = ref('')
const showTyping = ref(false)
const hasMoreMessages = ref(true)
const currentOffset = ref(0)
const typingTimeout = ref<number | null>(null)
const showDetailsPanel = ref(false)

// Computed
const displayName = computed(() => {
  if (!chat.value) return 'Chat'
  return chat.value.name || chat.value.customer_name || chat.value.customer_phone || 'Chat sin nombre'
})

const displayMessages = computed(() => {
  // Store keeps messages in newest-first order, reverse for chronological display
  return [...messages.value].reverse()
})

const avatarText = computed(() => {
  const name = displayName.value
  if (!name || name === 'Chat sin nombre') return ''
  
  const words = name.split(' ')
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const chatStatus = computed(() => {
  if (!chat.value) return ''

  const parts = []
  if (chat.value.customer_phone) parts.push(chat.value.customer_phone)
  if (chat.value.is_assigned && chat.value.assigned_user_name) {
    parts.push(`Asignado a ${chat.value.assigned_user_name}`)
  }

  return parts.join(' • ')
})

// Methods
const loadChat = async () => {
  const channelId = route.params.channelId as string
  const chatId = route.params.chatId as string
  
  if (!channelId || !chatId) return

  isLoading.value = true
  error.value = ''

  try {
    chat.value = await chatsService.getChat(channelId, chatId)
  } catch (err: any) {
    error.value = err.detail || 'Error al cargar el chat'
    console.error('Error loading chat:', err)
  } finally {
    isLoading.value = false
  }
}

const loadMessages = async (offset = 0, append = false) => {
  const channelId = route.params.channelId as string
  const chatId = route.params.chatId as string

  if (!channelId || !chatId) return

  if (append) {
    isLoadingMore.value = true
  } else {
    isLoading.value = true
  }
  error.value = ''

  try {
    const filters: MessagesFiltersParams = {
      limit: 50,
      offset
    }

    const loadedMessages = await messagesStore.fetchMessages(channelId, chatId, filters)

    if (append) {
      // Backend returns newest first, so when loading older messages, append to end
      messages.value = [...messages.value, ...loadedMessages]
    } else {
      // Initial load: store as-is (newest first)
      messages.value = loadedMessages
      await nextTick()
      scrollToBottom()
    }

    // Update pagination info (simplified for now)
    hasMoreMessages.value = loadedMessages.length === 50
    currentOffset.value = offset + loadedMessages.length

  } catch (err: any) {
    error.value = err.detail || err.message || 'Error al cargar los mensajes'
    console.error('Error loading messages:', err)
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

const sendMessage = async (messageData: SendMessageRequest) => {
  const channelId = route.params.channelId as string
  const chatId = route.params.chatId as string

  if (!channelId || !chatId || !messageData.content.trim()) return

  isSending.value = true

  console.log('📤 Sending message:', messageData)
  console.log('📤 To channel:', channelId, 'chat:', chatId)

  try {
    const newMessage = await messagesStore.sendMessage(channelId, chatId, messageData)
    if (newMessage) {
      // Store already adds message at beginning (newest first), update local array
      messages.value = messagesStore.getChatMessages(chatId).value
      await nextTick()
      scrollToBottom()
    }

  } catch (err: any) {
    error.value = err.detail || 'Error al enviar el mensaje'
    console.error('Error sending message:', err)
  } finally {
    isSending.value = false
  }
}

const handleTyping = () => {
  // Show typing indicator logic would go here
  // For now, we'll just clear any existing timeout
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
}

const handleScroll = () => {
  const container = messagesContainer.value
  if (!container || !hasMoreMessages.value || isLoadingMore.value) return

  // Load more messages when scrolled near the top
  if (container.scrollTop < 100) {
    loadMessages(currentOffset.value, true)
  }
}

const scrollToBottom = (smooth = false) => {
  const container = messagesContainer.value
  if (!container) return

  container.scrollTo({
    top: container.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto'
  })
}

const goBack = () => {
  const channelId = route.params.channelId as string
  router.push(`/channel/${channelId}`)
}

const toggleDetails = () => {
  showDetailsPanel.value = !showDetailsPanel.value
}

const closeDetailsPanel = () => {
  showDetailsPanel.value = false
}

const handleAssignUser = () => {
  // TODO: Implement user assignment logic
  console.log('Assign user functionality to be implemented')
}

const handleMarkRead = () => {
  // TODO: Implement mark as read logic
  console.log('Mark as read functionality to be implemented')
}

const handleAgentUpdated = (agentId: string, active: boolean) => {
  console.log(`Agent ${agentId} updated to ${active ? 'active' : 'inactive'}`)
  // Optionally refresh chat data or show notification
}

// WebSocket event handlers
const handleNewMessage = (event: NewMessageEvent) => {
  const currentChannelId = route.params.channelId as string
  const currentChatId = route.params.chatId as string

  // Only handle messages for the current chat
  if (event.channel_id === currentChannelId && event.chat_id === currentChatId) {
    console.log(`New message received for current chat ${currentChatId}, refreshing messages`)

    // Refresh messages for the current chat
    messagesStore.refreshMessages(currentChannelId, currentChatId)
      .then(() => {
        // Update local messages from store (already in newest-first order)
        const chatMessages = messagesStore.getChatMessages(currentChatId).value
        messages.value = chatMessages

        // Auto-scroll to new message
        nextTick(() => {
          scrollToBottom(true) // Smooth scroll for new messages
        })
      })
      .catch(err => {
        console.error('Error refreshing messages after WebSocket event:', err)
      })
  }
}

// Watchers
watch(
  () => [route.params.channelId, route.params.chatId],
  ([newChannelId, newChatId]) => {
    if (newChannelId && newChatId) {
      loadChat()
      loadMessages()
      // Close details panel when switching chats
      showDetailsPanel.value = false
    }
  }
)

// Lifecycle
onMounted(() => {
  const channelId = route.params.channelId as string
  const chatId = route.params.chatId as string

  if (channelId) {
    authStore.setLastVisitedChannel(channelId)
  }

  if (channelId && chatId) {
    loadChat()
    loadMessages()
  }

  // Initialize WebSocket and listen for new messages
  websocketStore.initialize()
  websocketStore.onNewMessage(handleNewMessage)
})

onUnmounted(() => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }

  // Clean up WebSocket listeners
  websocketStore.offNewMessage(handleNewMessage)
})
</script>

<style scoped>
.chat-view {
  height: 100vh;
  background: rgb(var(--v-theme-surface));
}

.chat-header {
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  flex-shrink: 0;
}

.border-b {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.border-t {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.messages-container {
  background: rgb(var(--v-theme-background));
  background-image: 
    radial-gradient(circle at 20px 20px, rgba(var(--v-theme-on-surface), 0.05) 1px, transparent 1px),
    radial-gradient(circle at 60px 60px, rgba(var(--v-theme-on-surface), 0.05) 1px, transparent 1px);
  background-size: 80px 80px;
  background-position: 0 0, 40px 40px;
}

.messages-list {
  padding: 8px 0;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.message-input-container {
  background: rgb(var(--v-theme-surface));
  flex-shrink: 0;
}

.typing-indicator {
  display: flex;
  justify-content: flex-start;
  margin-left: 16px;
}

.typing-bubble {
  background: rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 18px;
  padding: 8px 12px;
  max-width: 60px;
}

.typing-dots {
  display: flex;
  gap: 3px;
  align-items: center;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: rgba(var(--v-theme-on-surface), 0.5);
  border-radius: 50%;
  animation: typing-bounce 1.5s infinite;
}

.typing-dots span:nth-child(1) {
  animation-delay: 0s;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-8px);
  }
}

/* Panel adjustments for desktop */
@media (min-width: 960px) {
  .chat-view.panel-open {
    margin-right: 350px;
    transition: margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .chat-view:not(.panel-open) {
    margin-right: 0;
    transition: margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

/* Mobile: no margin adjustments, panel is overlay */
@media (max-width: 959px) {
  .chat-view.panel-open {
    margin-right: 0;
  }
}
</style>