<!--
Channel Selector Component

Permite seleccionar entre "Todos los canales" o un canal específico
- Opción "Todos" por defecto
- Lista de canales disponibles
- Emite eventos cuando cambia la selección

Props:
- channels: ChannelOption[] - Lista de canales disponibles
- modelValue: string | null - Canal seleccionado (null = todos)

Emits:
- update:modelValue: when selection changes
-->

<template>
  <div class="channel-selector">
    <v-select
      :model-value="modelValue"
      :items="selectItems"
      item-title="name"
      item-value="id"
      variant="outlined"
      density="compact"
      hide-details
      placeholder="Seleccionar canal..."
      @update:model-value="handleSelectionChange"
    >
      <template #prepend-inner>
        <v-icon size="small" color="on-surface-variant">
          mdi-filter-variant
        </v-icon>
      </template>

      <template #item="{ props: itemProps, item }">
        <v-list-item v-bind="itemProps">
          <template #prepend>
            <v-icon
              :color="getChannelColor(item.raw.platform)"
              size="small"
            >
              {{ getChannelIcon(item.raw.platform) }}
            </v-icon>
          </template>
          <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
          <v-list-item-subtitle v-if="item.raw.platform">
            {{ getPlatformDisplayName(item.raw.platform) }}
          </v-list-item-subtitle>
        </v-list-item>
      </template>

      <template #selection="{ item }">
        <div class="d-flex align-center">
          <v-icon
            v-if="item.raw.platform"
            :color="getChannelColor(item.raw.platform)"
            size="small"
            class="mr-2"
          >
            {{ getChannelIcon(item.raw.platform) }}
          </v-icon>
          <v-icon
            v-else
            color="primary"
            size="small"
            class="mr-2"
          >
            mdi-view-dashboard
          </v-icon>
          <span>{{ item.raw.name }}</span>
        </div>
      </template>
    </v-select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChannelOption } from '@/types/allChats'

interface Props {
  channels: ChannelOption[]
  modelValue: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

// Computed items for select (includes "All" option)
const selectItems = computed(() => [
  {
    id: null,
    name: 'Todos los canales',
    platform: null
  },
  ...props.channels
])

// Methods
const handleSelectionChange = (value: string | null | undefined) => {
  emit('update:modelValue', value ?? null)
}

const getChannelIcon = (platform: string | null | undefined) => {
  if (!platform) return 'mdi-view-dashboard'

  switch (platform.toLowerCase()) {
    case 'whatsapp':
    case 'whatsapp_twilio':
      return 'mdi-whatsapp'
    case 'telegram':
      return 'mdi-telegram'
    case 'instagram':
      return 'mdi-instagram'
    case 'facebook':
      return 'mdi-facebook'
    case 'twitter':
      return 'mdi-twitter'
    default:
      return 'mdi-chat'
  }
}

const getChannelColor = (platform: string | null | undefined) => {
  if (!platform) return 'primary'

  switch (platform.toLowerCase()) {
    case 'whatsapp':
    case 'whatsapp_twilio':
      return 'success'
    case 'telegram':
      return 'info'
    case 'instagram':
      return 'purple'
    case 'facebook':
      return 'indigo'
    case 'twitter':
      return 'light-blue'
    default:
      return 'grey'
  }
}

const getPlatformDisplayName = (platform: string | null) => {
  if (!platform) return ''

  switch (platform.toLowerCase()) {
    case 'whatsapp':
      return 'WhatsApp'
    case 'whatsapp_twilio':
      return 'WhatsApp Business'
    case 'telegram':
      return 'Telegram'
    case 'instagram':
      return 'Instagram'
    case 'facebook':
      return 'Facebook'
    case 'twitter':
      return 'Twitter'
    default:
      return platform
  }
}
</script>

<style scoped>
.channel-selector {
  width: 100%;
}
</style>