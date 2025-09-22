<!--
ChatInfoTab Component

Tab con información esencial del chat:
- Nombre del contacto
- ID Externo
- Fecha de creación

Props: chat (ChatResponse)
Emits: @assign-user, @mark-read
-->

<template>
  <div class="chat-info-tab pa-4">
    <!-- Contact Header -->
    <div class="contact-header text-center mb-6">
      <v-avatar size="80" color="primary" class="mb-4">
        <v-icon v-if="!avatarText" color="white" size="40">mdi-account</v-icon>
        <span v-else class="text-h5 font-weight-bold">{{ avatarText }}</span>
      </v-avatar>
      <h3 class="text-h6 font-weight-medium mb-2">
        {{ displayName }}
      </h3>
    </div>

    <!-- Essential Information -->
    <div class="info-section">
      <v-list lines="two" class="bg-transparent">
        <v-list-item>
          <template #prepend>
            <v-icon color="on-surface-variant">mdi-identifier</v-icon>
          </template>
          <v-list-item-title class="text-body-2 text-on-surface-variant">ID Externo</v-list-item-title>
          <v-list-item-subtitle class="text-body-1">{{ chat.external_id || 'No disponible' }}</v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <template #prepend>
            <v-icon color="on-surface-variant">mdi-calendar</v-icon>
          </template>
          <v-list-item-title class="text-body-2 text-on-surface-variant">Creado</v-list-item-title>
          <v-list-item-subtitle class="text-body-1">{{ chat.created_at ? formatDate(chat.created_at) : 'No disponible' }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChatResponse } from '@/types/channels'
import { formatDateWithTimezone } from '@/config'

interface Props {
  chat: ChatResponse
}

const props = defineProps<Props>()

defineEmits<{
  'assign-user': []
  'mark-read': []
}>()

// Computed properties
const displayName = computed(() => {
  return props.chat.name || props.chat.customer_name || props.chat.customer_phone || 'Contacto sin nombre'
})

const avatarText = computed(() => {
  const name = displayName.value
  if (!name || name === 'Contacto sin nombre') return ''

  const words = name.split(' ')
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

// Methods
const formatDate = (dateString: string) => {
  if (!dateString) return 'No disponible'

  try {
    return formatDateWithTimezone(dateString, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } catch (error) {
    console.warn('Error formatting date:', dateString, error)
    return 'Fecha inválida'
  }
}
</script>

<style scoped>
.chat-info-tab {
  max-height: 100%;
  overflow-y: auto;
}

.contact-header .v-avatar {
  flex-shrink: 0;
}
</style>