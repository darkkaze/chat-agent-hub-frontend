<!--
MessageInput Component

Componente para la entrada de mensajes en el chat.
Incluye funcionalidad para texto y archivos adjuntos.
Basado en el estilo de WhatsApp Web.

Props:
- disabled: boolean - si está deshabilitado

Emits:
- send: cuando se envía un mensaje
- typing: cuando el usuario está escribiendo
-->

<template>
  <div class="message-input pa-4">
    <div class="d-flex align-center gap-3">
      <!-- Attach button -->
      <v-btn
        icon="mdi-paperclip"
        variant="text"
        size="small"
        :disabled="disabled"
        @click="toggleAttachMenu"
      />

      <!-- Attach menu -->
      <v-menu
        v-model="showAttachMenu"
        :close-on-content-click="false"
        location="top start"
      >
        <template v-slot:activator="{ props: menuProps }">
          <span v-bind="menuProps"></span>
        </template>
        <v-card min-width="200">
          <v-list>
            <v-list-item @click="selectFile('image')">
              <template v-slot:prepend>
                <v-icon color="primary">mdi-image</v-icon>
              </template>
              <v-list-item-title>Imagen</v-list-item-title>
            </v-list-item>
            <v-list-item @click="selectFile('document')">
              <template v-slot:prepend>
                <v-icon color="primary">mdi-file</v-icon>
              </template>
              <v-list-item-title>Documento</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>

      <!-- Message input -->
      <div class="flex-1-1 position-relative">
        <v-textarea
          v-model="messageText"
          placeholder="Escribe un mensaje..."
          variant="outlined"
          density="compact"
          rows="1"
          auto-grow
          max-rows="5"
          hide-details
          :disabled="disabled"
          @keydown="handleKeydown"
          @input="handleInput"
          class="message-textarea"
        />
        
        <!-- File attachments preview -->
        <div v-if="attachments.length > 0" class="attachments-preview mt-2">
          <div
            v-for="(attachment, index) in attachments"
            :key="index"
            class="attachment-item d-flex align-center pa-2 rounded"
          >
            <v-icon
              :color="getAttachmentColor(attachment.type)"
              class="mr-2"
            >
              {{ getAttachmentIcon(attachment.type) }}
            </v-icon>
            <span class="flex-1-1 text-body-2">{{ attachment.name }}</span>
            <v-btn
              icon="mdi-close"
              size="x-small"
              variant="text"
              @click="removeAttachment(index)"
            />
          </div>
        </div>
      </div>

      <!-- Send button -->
      <v-btn
        icon="mdi-send"
        color="primary"
        :disabled="disabled || !messageText.trim()"
        @click="sendMessage"
      />
    </div>

    <!-- File input (hidden) -->
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="image/*,application/pdf,.doc,.docx,.txt"
      style="display: none"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SendMessageRequest, MessageAttachment } from '@/types/channels'

interface Props {
  disabled?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  send: [message: SendMessageRequest]
  typing: []
}>()

// Refs
const fileInput = ref<HTMLInputElement>()

// Reactive data
const messageText = ref('')
const attachments = ref<MessageAttachment[]>([])
const showAttachMenu = ref(false)
const typingTimeout = ref<number | null>(null)

// Methods
const sendMessage = () => {
  const text = messageText.value.trim()
  
  if (!text) return

  const messageData: SendMessageRequest = {
    content: text
  }

  emit('send', messageData)
  
  // Clear input
  messageText.value = ''
  attachments.value = []
}

const handleKeydown = (event: KeyboardEvent) => {
  // Send message on Enter (but not Shift+Enter)
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const handleInput = () => {
  // Clear existing timeout
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
  
  // Emit typing event
  emit('typing')
  
  // Set new timeout
  typingTimeout.value = setTimeout(() => {
    // Could emit 'stopped-typing' here if needed
  }, 1000)
}

const toggleAttachMenu = () => {
  showAttachMenu.value = !showAttachMenu.value
}

const selectFile = (type: 'image' | 'document') => {
  if (!fileInput.value) return
  
  // Set accept attribute based on type
  if (type === 'image') {
    fileInput.value.accept = 'image/*'
  } else {
    fileInput.value.accept = 'application/pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx'
  }
  
  fileInput.value.click()
  showAttachMenu.value = false
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (!files || files.length === 0) return

  Array.from(files).forEach(file => {
    const attachment: MessageAttachment = {
      type: file.type.startsWith('image/') ? 'image' : 'document',
      url: URL.createObjectURL(file), // This would be replaced with actual upload URL
      name: file.name,
      size: file.size,
      mime_type: file.type
    }
    
    attachments.value.push(attachment)
  })

  // Clear the input
  target.value = ''
}

const removeAttachment = (index: number) => {
  // Revoke object URL to free memory
  const attachment = attachments.value[index]
  if (attachment.url.startsWith('blob:')) {
    URL.revokeObjectURL(attachment.url)
  }
  
  attachments.value.splice(index, 1)
}

const getAttachmentIcon = (type: MessageAttachment['type']) => {
  switch (type) {
    case 'image':
      return 'mdi-image'
    case 'document':
      return 'mdi-file-document'
    case 'audio':
      return 'mdi-volume-high'
    case 'video':
      return 'mdi-video'
    default:
      return 'mdi-file'
  }
}

const getAttachmentColor = (type: MessageAttachment['type']) => {
  switch (type) {
    case 'image':
      return 'success'
    case 'document':
      return 'primary'
    case 'audio':
      return 'warning'
    case 'video':
      return 'info'
    default:
      return 'grey'
  }
}

// Cleanup on unmount
watch(() => attachments.value, (newAttachments, oldAttachments) => {
  // Cleanup old blob URLs that were removed
  if (oldAttachments) {
    oldAttachments.forEach(oldAttachment => {
      const stillExists = newAttachments.some(newAttachment => 
        newAttachment.url === oldAttachment.url
      )
      
      if (!stillExists && oldAttachment.url.startsWith('blob:')) {
        URL.revokeObjectURL(oldAttachment.url)
      }
    })
  }
}, { deep: true })
</script>

<style scoped>
.message-input {
  background: rgb(var(--v-theme-surface));
}

.message-textarea :deep(.v-field__field) {
  border-radius: 24px !important;
}

.message-textarea :deep(.v-field__outline) {
  border-radius: 24px !important;
}

.attachments-preview {
  max-height: 120px;
  overflow-y: auto;
}

.attachment-item {
  background: rgba(var(--v-theme-primary), 0.1);
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  margin-bottom: 4px;
}

.attachment-item:last-child {
  margin-bottom: 0;
}
</style>