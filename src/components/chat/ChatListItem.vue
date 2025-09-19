<!--
ChatListItem Component

Componente individual para mostrar un chat en la lista.
Basado en el estilo de WhatsApp Web.

Props:
- chat: ChatResponse - datos del chat
- isSelected: boolean - si está seleccionado

Emits:
- click: cuando se hace click en el item
-->

<template>
  <div 
    class="chat-item"
    :class="{ 'chat-item--selected': isSelected, 'chat-item--unread': chat.unread_count > 0 }"
    @click="$emit('click')"
  >
    <div class="chat-avatar">
      <v-avatar size="48" color="primary">
        <v-icon v-if="!avatarText" color="white">mdi-account</v-icon>
        <span v-else class="text-h6 font-weight-bold">{{ avatarText }}</span>
      </v-avatar>
    </div>

    <div class="chat-content">
      <div class="chat-header">
        <div class="chat-name">
          <span class="text-subtitle-1 font-weight-medium">
            {{ displayName }}
          </span>
          <span v-if="chat.external_id" class="text-caption text-on-surface-variant ml-2">
            {{ chat.external_id }}
          </span>
          <div v-if="chat.is_assigned" class="assigned-indicator ml-2">
            <v-icon size="14" color="success">mdi-account-check</v-icon>
          </div>
        </div>
        
        <div class="chat-time">
          <span class="text-caption text-on-surface-variant">
            {{ formatTime(chat.last_message_ts) }}
          </span>
        </div>
      </div>

      <div class="chat-preview">
        <div class="chat-message">
          <span 
            class="text-body-2"
            :class="chat.unread_count > 0 ? 'text-on-surface' : 'text-on-surface-variant'"
          >
            {{ messagePreview }}
          </span>
        </div>

        <div class="chat-indicators">
          <!-- Unread count badge -->
          <v-badge
            v-if="chat.unread_count > 0"
            :content="chat.unread_count > 99 ? '99+' : chat.unread_count.toString()"
            color="primary"
            inline
          />
        </div>
      </div>

      <!-- Additional info (phone if available) -->
      <div v-if="chat.customer_phone" class="chat-phone mt-1">
        <span class="text-caption text-on-surface-variant">
          {{ chat.customer_phone }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChatResponse } from '@/types/channels'
import { SenderType } from '@/types/api'
import { getTimeDifferenceMs } from '@/config'

interface Props {
  chat: ChatResponse
  isSelected?: boolean
}

const props = defineProps<Props>()
defineEmits<{
  click: []
}>()

// Computed
const displayName = computed(() => {
  return props.chat.name || props.chat.customer_name || props.chat.customer_phone || 'Chat sin nombre'
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

const messagePreview = computed(() => {
  if (!props.chat.last_message) {
    return 'Sin mensajes'
  }
  
  // Get sender label
  const senderLabel = getSenderLabel(props.chat.last_sender_type)
  
  // Get first 5 words of message
  const words = props.chat.last_message.split(' ').slice(0, 5)
  const messageSnippet = words.join(' ')
  const truncated = words.length >= 5 ? '...' : ''
  
  return senderLabel 
    ? `${senderLabel}: ${messageSnippet}${truncated}`
    : `${messageSnippet}${truncated}`
})

const getSenderLabel = (senderType?: SenderType | string): string => {
  switch (senderType) {
    case 'CONTACT':
    case SenderType.CONTACT:
      return 'cliente'
    case 'USER':
    case SenderType.USER:
      return 'user'  
    case 'AGENT':
    case SenderType.AGENT:
      return 'agente'
    default:
      return ''
  }
}

const formatTime = (timestamp?: string) => {
  if (!timestamp) {
    return ''
  }
  
  // Usar la función de diferencia que maneja timezone correctamente
  const diffMs = getTimeDifferenceMs(timestamp)
  
  // Convert to different time units
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)
  
  // Very recent (less than 1 minute)
  if (seconds < 60) {
    return 'ahora'
  }
  
  // Minutes (1-59 minutes)
  if (minutes < 60) {
    return `hace ${minutes}m`
  }
  
  // Hours (1-23 hours)
  if (hours < 24) {
    return `hace ${hours}h`
  }
  
  // Days (1-6 days)
  if (days < 7) {
    return `hace ${days}d`
  }
  
  // Weeks (1-4 weeks)
  if (weeks < 5) {
    return `hace ${weeks}sem`
  }
  
  // Months (1-11 months)
  if (months < 12) {
    return `hace ${months}mes`
  }
  
  // Years
  return `hace ${years}a`
}
</script>

<style scoped>
.chat-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  cursor: pointer;
  transition: background-color 0.2s ease;
  background: rgb(var(--v-theme-surface));
}

.chat-item:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.chat-item--selected {
  background: rgba(var(--v-theme-primary), 0.12);
}

.chat-item--selected:hover {
  background: rgba(var(--v-theme-primary), 0.16);
}

.chat-item--unread {
  background: rgba(var(--v-theme-primary), 0.05);
}

.chat-avatar {
  margin-right: 12px;
  flex-shrink: 0;
}

.chat-content {
  flex: 1;
  min-width: 0; /* Para permitir text truncation */
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.chat-name {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.chat-name span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  flex-shrink: 0;
  margin-left: 8px;
}

.chat-preview {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 8px;
}

.chat-message {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.chat-message span {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.chat-indicators {
  flex-shrink: 0;
}

.chat-phone {
  margin-top: 2px;
}

.assigned-indicator {
  flex-shrink: 0;
}
</style>