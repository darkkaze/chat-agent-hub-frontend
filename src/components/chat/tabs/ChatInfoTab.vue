<!--
ChatInfoTab Component

Tab con información general del chat:
- Información del contacto (avatar, nombre, teléfono)
- Estado del chat (asignación, última actividad)
- Estadísticas básicas
- Acciones disponibles

Props: chat (ChatResponse)
Emits: @assign-user, @mark-read
-->

<template>
  <div class="chat-info-tab pa-4">
    <!-- Contact Information -->
    <div class="contact-section mb-6">
      <div class="d-flex align-center mb-4">
        <v-avatar size="64" color="primary" class="mr-4">
          <v-icon v-if="!avatarText" color="white" size="32">mdi-account</v-icon>
          <span v-else class="text-h6 font-weight-bold">{{ avatarText }}</span>
        </v-avatar>
        <div class="flex-1-1">
          <h3 class="text-h6 font-weight-medium mb-1">
            {{ displayName }}
          </h3>
          <p class="text-body-2 text-on-surface-variant mb-0">
            {{ chat.customer_phone || 'Sin teléfono' }}
          </p>
        </div>
      </div>

      <!-- Contact Details -->
      <v-card variant="outlined" class="mb-4">
        <v-list density="compact">
          <v-list-item>
            <template #prepend>
              <v-icon color="on-surface-variant">mdi-identifier</v-icon>
            </template>
            <v-list-item-title>ID Externo</v-list-item-title>
            <v-list-item-subtitle>{{ chat.external_id || 'No disponible' }}</v-list-item-subtitle>
          </v-list-item>

          <v-list-item v-if="chat.customer_phone">
            <template #prepend>
              <v-icon color="on-surface-variant">mdi-phone</v-icon>
            </template>
            <v-list-item-title>Teléfono</v-list-item-title>
            <v-list-item-subtitle>{{ chat.customer_phone }}</v-list-item-subtitle>
            <template #append>
              <v-btn icon="mdi-content-copy" variant="text" size="small" @click="copyPhone" />
            </template>
          </v-list-item>

          <v-list-item>
            <template #prepend>
              <v-icon color="on-surface-variant">mdi-calendar</v-icon>
            </template>
            <v-list-item-title>Creado</v-list-item-title>
            <v-list-item-subtitle>{{ formatDate(chat.created_at) }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card>
    </div>

    <!-- Chat Status -->
    <div class="status-section mb-6">
      <h4 class="text-subtitle-1 font-weight-medium mb-3">Estado del Chat</h4>

      <v-card variant="outlined">
        <v-list density="compact">
          <v-list-item>
            <template #prepend>
              <v-icon :color="assignmentColor">mdi-account-check</v-icon>
            </template>
            <v-list-item-title>Asignación</v-list-item-title>
            <v-list-item-subtitle>
              {{ chat.is_assigned ? `Asignado a ${chat.assigned_user_name}` : 'Sin asignar' }}
            </v-list-item-subtitle>
            <template #append>
              <v-btn
                variant="text"
                size="small"
                :icon="chat.is_assigned ? 'mdi-account-switch' : 'mdi-account-plus'"
                @click="$emit('assign-user')"
              />
            </template>
          </v-list-item>

          <v-list-item>
            <template #prepend>
              <v-icon :color="unreadColor">mdi-message</v-icon>
            </template>
            <v-list-item-title>Mensajes no leídos</v-list-item-title>
            <v-list-item-subtitle>{{ chat.unread_count }} mensajes</v-list-item-subtitle>
            <template #append>
              <v-btn
                v-if="chat.unread_count > 0"
                variant="text"
                size="small"
                icon="mdi-check-all"
                @click="$emit('mark-read')"
              />
            </template>
          </v-list-item>

          <v-list-item v-if="chat.last_message_at">
            <template #prepend>
              <v-icon color="on-surface-variant">mdi-clock-outline</v-icon>
            </template>
            <v-list-item-title>Última actividad</v-list-item-title>
            <v-list-item-subtitle>{{ formatLastActivity(chat.last_message_at) }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card>
    </div>

    <!-- Last Message Preview -->
    <div v-if="chat.last_message" class="last-message-section mb-6">
      <h4 class="text-subtitle-1 font-weight-medium mb-3">Último Mensaje</h4>

      <v-card variant="outlined" class="pa-3">
        <div class="d-flex align-center mb-2">
          <v-icon
            :color="lastSenderColor"
            size="16"
            class="mr-2"
          >
            {{ lastSenderIcon }}
          </v-icon>
          <span class="text-caption text-on-surface-variant">
            {{ lastSenderText }}
          </span>
        </div>
        <p class="text-body-2 mb-0 last-message-text">
          {{ chat.last_message }}
        </p>
      </v-card>
    </div>

    <!-- Extra Data -->
    <div v-if="hasExtraData" class="extra-data-section mb-6">
      <h4 class="text-subtitle-1 font-weight-medium mb-3">Información Adicional</h4>

      <v-card variant="outlined">
        <v-list density="compact">
          <v-list-item
            v-for="(value, key) in chat.extra_data"
            :key="key"
          >
            <v-list-item-title>{{ formatKey(key) }}</v-list-item-title>
            <v-list-item-subtitle>{{ formatValue(value) }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card>
    </div>

    <!-- Actions -->
    <div class="actions-section">
      <h4 class="text-subtitle-1 font-weight-medium mb-3">Acciones</h4>

      <div class="d-flex flex-column ga-2">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-account-plus"
          block
          @click="$emit('assign-user')"
        >
          {{ chat.is_assigned ? 'Reasignar Usuario' : 'Asignar Usuario' }}
        </v-btn>

        <v-btn
          v-if="chat.unread_count > 0"
          variant="outlined"
          prepend-icon="mdi-check-all"
          block
          @click="$emit('mark-read')"
        >
          Marcar como Leído
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChatResponse } from '@/types/channels'
import { SenderType } from '@/types/api'
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

const assignmentColor = computed(() => {
  return props.chat.is_assigned ? 'success' : 'warning'
})

const unreadColor = computed(() => {
  return props.chat.unread_count > 0 ? 'error' : 'success'
})

const lastSenderColor = computed(() => {
  switch (props.chat.last_sender_type) {
    case SenderType.CONTACT:
      return 'primary'
    case SenderType.USER:
    case SenderType.AGENT:
      return 'secondary'
    default:
      return 'on-surface-variant'
  }
})

const lastSenderIcon = computed(() => {
  switch (props.chat.last_sender_type) {
    case SenderType.CONTACT:
      return 'mdi-account'
    case SenderType.USER:
      return 'mdi-account-tie'
    case SenderType.AGENT:
      return 'mdi-robot'
    default:
      return 'mdi-message'
  }
})

const lastSenderText = computed(() => {
  switch (props.chat.last_sender_type) {
    case SenderType.CONTACT:
      return 'Contacto'
    case SenderType.USER:
      return 'Usuario'
    case SenderType.AGENT:
      return 'Agente'
    default:
      return 'Desconocido'
  }
})

const hasExtraData = computed(() => {
  return props.chat.extra_data && Object.keys(props.chat.extra_data).length > 0
})

// Methods
const formatDate = (dateString: string) => {
  return formatDateWithTimezone(dateString, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

const formatLastActivity = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffHours / 24

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    return `Hace ${diffMinutes} minutos`
  } else if (diffHours < 24) {
    return `Hace ${Math.floor(diffHours)} horas`
  } else if (diffDays < 7) {
    return `Hace ${Math.floor(diffDays)} días`
  } else {
    return formatDate(dateString)
  }
}

const formatKey = (key: string) => {
  return key.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const formatValue = (value: any) => {
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

const copyPhone = async () => {
  if (props.chat.customer_phone) {
    try {
      await navigator.clipboard.writeText(props.chat.customer_phone)
    } catch (err) {
      console.error('Failed to copy phone number:', err)
    }
  }
}
</script>

<style scoped>
.chat-info-tab {
  max-height: 100%;
  overflow-y: auto;
}

.last-message-text {
  max-height: 60px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.contact-section .v-avatar {
  flex-shrink: 0;
}
</style>