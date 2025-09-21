<template>
  <div 
    class="message-bubble"
    :class="messageClasses"
  >
    <div class="message-content">
      <div v-if="messageText" class="message-text">
        <p class="mb-0">{{ messageText }}</p>
      </div>

      <div v-if="hasMediaContent" class="message-media mb-2">
        <v-img
          v-if="isImage && mediaUrl"
          :src="mediaUrl"
          :alt="'Imagen'"
          max-width="300"
          max-height="200"
          class="rounded-lg"
          cover
        >
          <template v-slot:placeholder>
            <div class="d-flex align-center justify-center fill-height">
              <v-progress-circular indeterminate color="primary" />
            </div>
          </template>
          <template v-slot:error>
            <div class="d-flex align-center justify-center fill-height">
              <v-icon color="error">mdi-image-broken</v-icon>
            </div>
          </template>
        </v-img>

        <div v-else-if="isVideo" class="video-placeholder">
          <v-icon size="48" color="on-surface-variant">mdi-play-circle-outline</v-icon>
          <p class="text-caption mt-2 mb-0">Video</p>
        </div>
      </div>

      <div v-if="hasDocument" class="message-document mb-2">
        <div class="document-preview d-flex align-center pa-3 rounded-lg">
          <v-icon size="32" color="primary" class="mr-3">
            {{ documentIcon }}
          </v-icon>
          <div class="flex-1-1">
            <p class="text-body-2 font-weight-medium mb-1">
              {{ documentName || 'Documento' }}
            </p>
            <p class="text-caption text-on-surface-variant mb-0">
              Documento
            </p>
          </div>
          <v-btn 
            icon="mdi-download" 
            size="small" 
            variant="text"
            @click="downloadDocument"
          />
        </div>
      </div>

      <div class="message-info d-flex align-center justify-end mt-1">
        <span class="message-time text-caption">
          {{ formatTime(message.timestamp) }}
        </span>
        
        <div v-if="!message.is_from_customer" class="message-status ml-1">
          <v-icon size="16" :color="statusColor">
            {{ statusIcon }}
          </v-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MessageResponse } from '@/types/channels'
import { MessageStatus, DeliveryStatus } from '@/types/api'
import { formatDateWithTimezone } from '@/config'

interface Props {
  message: MessageResponse
}

const props = defineProps<Props>()


const messageClasses = computed(() => {
  const senderType = props.message.sender_type
  
  return {
    'message-bubble--contact': senderType === 'CONTACT',      // Izquierda, color secundario
    'message-bubble--agent': senderType === 'AGENT',         // Derecha, color secundario  
    'message-bubble--user': senderType === 'USER',           // Derecha, color primario
    // Fallback para compatibilidad con is_from_customer
    'message-bubble--incoming': !senderType && props.message.is_from_customer,
    'message-bubble--outgoing': !senderType && !props.message.is_from_customer
  }
})

const messageText = computed(() => {
  const content = props.message.content
  // Si content es un string, devolverlo directamente
  if (typeof content === 'string') {
    return content
  }
  // Si content es un objeto, buscar la propiedad text
  if (content && typeof content === 'object' && 'text' in content) {
    return content.text
  }
  return null
})

const hasMediaContent = computed(() => {
  const content = props.message.content
  if (typeof content === 'object' && content) {
    return !!(content.media_url && content.media_type)
  }
  return false
})

const hasDocument = computed(() => {
  const content = props.message.content
  if (typeof content === 'object' && content) {
    return !!(content.document_url)
  }
  return false
})

const isImage = computed(() => {
  const content = props.message.content
  if (typeof content === 'object' && content) {
    const mediaType = content.media_type
    return mediaType === 'image' || mediaType?.startsWith('image/')
  }
  return false
})

const isVideo = computed(() => {
  const content = props.message.content
  if (typeof content === 'object' && content) {
    const mediaType = content.media_type
    return mediaType === 'video' || mediaType?.startsWith('video/')
  }
  return false
})

const documentIcon = computed(() => {
  const content = props.message.content
  if (typeof content === 'object' && content) {
    const fileName = content.document_name || ''
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'pdf':
        return 'mdi-file-pdf-box'
      case 'doc':
      case 'docx':
        return 'mdi-file-word-box'
      case 'xls':
      case 'xlsx':
        return 'mdi-file-excel-box'
      case 'ppt':
      case 'pptx':
        return 'mdi-file-powerpoint-box'
      case 'txt':
        return 'mdi-file-document-outline'
      case 'zip':
      case 'rar':
        return 'mdi-folder-zip'
      default:
        return 'mdi-file-outline'
    }
  }
  return 'mdi-file-outline'
})

const mediaUrl = computed(() => {
  const content = props.message.content
  if (typeof content === 'object' && content) {
    return content.media_url
  }
  return null
})

const documentName = computed(() => {
  const content = props.message.content
  if (typeof content === 'object' && content) {
    return content.document_name
  }
  return null
})

const statusIcon = computed(() => {
  // Prioritize delivery_status if available
  const deliveryStatus = props.message.delivery_status
  if (deliveryStatus !== null) {
    switch (deliveryStatus) {
      case DeliveryStatus.PENDING:
      case DeliveryStatus.SENT:
        return 'mdi-check' // 1 palomita
      case DeliveryStatus.DELIVERED:
      case DeliveryStatus.READ:
        return 'mdi-check-all' // 2 palomitas
      case DeliveryStatus.FAILED:
        return 'mdi-alert-circle-outline'
      default:
        return 'mdi-check'
    }
  }

  // Fallback to old status for backward compatibility
  switch (props.message.status) {
    case MessageStatus.PENDING:
      return 'mdi-clock-outline'
    case MessageStatus.SENT:
      return 'mdi-check'
    case MessageStatus.DELIVERED:
      return 'mdi-check-all'
    case MessageStatus.READ:
      return 'mdi-check-all'
    case MessageStatus.FAILED:
      return 'mdi-alert-circle-outline'
    default:
      return 'mdi-clock-outline'
  }
})

const statusColor = computed(() => {
  // Prioritize delivery_status if available
  const deliveryStatus = props.message.delivery_status
  if (deliveryStatus !== null) {
    switch (deliveryStatus) {
      case DeliveryStatus.PENDING:
      case DeliveryStatus.SENT:
      case DeliveryStatus.DELIVERED:
        return 'on-surface-variant' // Gris
      case DeliveryStatus.READ:
        return 'primary' // Azul
      case DeliveryStatus.FAILED:
        return 'error' // Rojo
      default:
        return 'on-surface-variant'
    }
  }

  // Fallback to old status for backward compatibility
  switch (props.message.status) {
    case MessageStatus.PENDING:
      return 'on-surface-variant'
    case MessageStatus.SENT:
      return 'on-surface-variant'
    case MessageStatus.DELIVERED:
      return 'on-surface-variant'
    case MessageStatus.READ:
      return 'primary'
    case MessageStatus.FAILED:
      return 'error'
    default:
      return 'on-surface-variant'
  }
})

const formatTime = (timestamp: string) => {
  return formatDateWithTimezone(timestamp, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

const downloadDocument = () => {
  const content = props.message.content
  if (typeof content === 'object' && content?.document_url) {
    window.open(content.document_url, '_blank')
  }
}
</script>

<style scoped>
.message-bubble {
  display: flex;
  margin: 4px 0;
  max-width: 70%;
}

.message-bubble--incoming {
  justify-content: flex-start;
}

.message-bubble--outgoing {
  justify-content: flex-end;
  margin-left: auto;
}

.message-content {
  background: rgb(var(--v-theme-surface));
  border-radius: 18px;
  padding: 8px 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.message-bubble--incoming .message-content {
  background: rgb(var(--v-theme-surface));
  border-bottom-left-radius: 4px;
}

.message-bubble--outgoing .message-content {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  border-bottom-right-radius: 4px;
}

/* Nuevos estilos para diferentes sender types */

/* CONTACT - Izquierda, color secundario */
.message-bubble--contact {
  justify-content: flex-start;
}

.message-bubble--contact .message-content {
  background: rgb(var(--v-theme-secondary));
  color: rgb(var(--v-theme-on-secondary));
  border-bottom-left-radius: 4px;
}

/* AGENT - Derecha, color accent */
.message-bubble--agent {
  justify-content: flex-end;
  margin-left: auto;
}

.message-bubble--agent .message-content {
  background: rgb(var(--v-theme-accent));
  color: rgb(var(--v-theme-on-accent));
  border-bottom-right-radius: 4px;
}

/* USER - Derecha, color primario */
.message-bubble--user {
  justify-content: flex-end;
  margin-left: auto;
}

.message-bubble--user .message-content {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  border-bottom-right-radius: 4px;
}

.message-text {
  line-height: 1.4;
}

.message-text p {
  white-space: pre-wrap;
  word-break: break-word;
}

.message-media {
  border-radius: 8px;
  overflow: hidden;
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-on-surface), 0.1);
  min-height: 120px;
  border-radius: 8px;
}

.message-document .document-preview {
  background: rgba(var(--v-theme-on-surface), 0.1);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  min-width: 200px;
}

.message-bubble--outgoing .document-preview {
  background: rgba(var(--v-theme-on-primary), 0.1);
  border-color: rgba(var(--v-theme-on-primary), 0.2);
}

/* Document preview para nuevos sender types */
.message-bubble--user .document-preview {
  background: rgba(var(--v-theme-on-primary), 0.1);
  border-color: rgba(var(--v-theme-on-primary), 0.2);
}

.message-bubble--agent .document-preview {
  background: rgba(var(--v-theme-on-accent), 0.1);
  border-color: rgba(var(--v-theme-on-accent), 0.2);
}

.message-bubble--contact .document-preview {
  background: rgba(var(--v-theme-on-secondary), 0.1);
  border-color: rgba(var(--v-theme-on-secondary), 0.2);
}

.message-info {
  margin-top: 4px;
  gap: 2px;
}

.message-time {
  opacity: 0.7;
}

.message-bubble--outgoing .message-time {
  color: rgba(var(--v-theme-on-primary), 0.7);
}

/* Message time para nuevos sender types */
.message-bubble--user .message-time {
  color: rgba(var(--v-theme-on-primary), 0.7);
}

.message-bubble--agent .message-time {
  color: rgba(var(--v-theme-on-accent), 0.7);
}

.message-bubble--contact .message-time {
  color: rgba(var(--v-theme-on-secondary), 0.7);
}

.message-status {
  display: flex;
  align-items: center;
}

.message-bubble + .message-bubble--incoming,
.message-bubble + .message-bubble--outgoing {
  margin-top: 2px;
}

.message-bubble--incoming + .message-bubble--outgoing,
.message-bubble--outgoing + .message-bubble--incoming {
  margin-top: 16px;
}
</style>