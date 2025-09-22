<!--
Delete Channel Dialog

Diálogo de confirmación para eliminar un canal
- Muestra información del canal a eliminar
- Advertencias sobre las consecuencias
- Confirmación explícita requerida

Props: modelValue (boolean), channel (ChannelResponse | null)
Emits: @update:modelValue, @deleted
-->

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500px"
    persistent
  >
    <v-card>
      <v-card-title class="pa-6 border-b">
        <div class="d-flex align-center">
          <v-icon color="error" class="mr-3" size="24">
            mdi-delete-alert
          </v-icon>
          <h2 class="text-h5 font-weight-medium">
            Eliminar Canal
          </h2>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <div v-if="channel">
          <!-- Channel Info -->
          <div class="d-flex align-center mb-4 pa-3 rounded" style="background: rgba(var(--v-theme-error), 0.1)">
            <v-icon
              :color="getPlatformColor(channel.platform)"
              class="mr-3"
              size="32"
            >
              {{ getPlatformIcon(channel.platform) }}
            </v-icon>
            <div>
              <div class="text-h6 font-weight-medium">
                {{ channel.name }}
              </div>
              <div class="text-body-2 text-on-surface-variant">
                {{ getPlatformName(channel.platform) }} •
                Creado {{ formatDate(channel.created_at) }}
              </div>
            </div>
          </div>

          <!-- Warning Message -->
          <div class="mb-4">
            <p class="text-body-1 mb-3">
              ¿Estás seguro de que deseas eliminar este canal?
            </p>
          </div>

          <!-- Consequences Alert -->
          <v-alert
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            <template #prepend>
              <v-icon>mdi-alert-triangle</v-icon>
            </template>
            <div class="text-body-2">
              <strong>Consecuencias de eliminar este canal:</strong>
              <ul class="mt-2 ml-4">
                <li>Todos los chats asociados se marcarán como inactivos</li>
                <li>No se podrán enviar nuevos mensajes</li>
                <li>El historial de conversaciones se mantendrá</li>
                <li>Esta acción no se puede deshacer</li>
              </ul>
            </div>
          </v-alert>

          <!-- Confirmation Input -->
          <div class="mb-4">
            <p class="text-body-2 mb-3">
              Para confirmar, escribe el nombre del canal: <strong>{{ channel.name }}</strong>
            </p>
            <v-text-field
              v-model="confirmationText"
              label="Nombre del canal"
              variant="outlined"
              :error="showConfirmationError"
              :error-messages="confirmationError"
              autofocus
            />
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="pa-6 border-t">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="handleCancel"
          :disabled="isLoading"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="error"
          :loading="isLoading"
          :disabled="!isConfirmationValid"
          @click="handleConfirm"
        >
          Eliminar Canal
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { channelsService } from '@/services/channels/channelsService'
import { PlatformType } from '@/types/api'
import type { ChannelResponse } from '@/types/channels'

interface Props {
  modelValue: boolean
  channel: ChannelResponse | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'deleted': [channelId: string]
}>()

// State
const isLoading = ref(false)
const confirmationText = ref('')
const showConfirmationError = ref(false)

// Computed
const isConfirmationValid = computed(() => {
  return confirmationText.value === props.channel?.name
})

const confirmationError = computed(() => {
  if (!showConfirmationError.value) return []
  if (!confirmationText.value) return ['Debes escribir el nombre del canal']
  if (confirmationText.value !== props.channel?.name) {
    return ['El nombre no coincide']
  }
  return []
})

// Methods
const getPlatformIcon = (platform: PlatformType) => {
  switch (platform) {
    case PlatformType.WHATSAPP:
    case PlatformType.WHATSAPP_TWILIO:
      return 'mdi-whatsapp'
    case PlatformType.TELEGRAM:
      return 'mdi-telegram'
    case PlatformType.INSTAGRAM:
      return 'mdi-instagram'
    default:
      return 'mdi-chat'
  }
}

const getPlatformColor = (platform: PlatformType) => {
  switch (platform) {
    case PlatformType.WHATSAPP:
    case PlatformType.WHATSAPP_TWILIO:
      return 'success'
    case PlatformType.TELEGRAM:
      return 'info'
    case PlatformType.INSTAGRAM:
      return 'purple'
    default:
      return 'primary'
  }
}

const getPlatformName = (platform: PlatformType) => {
  switch (platform) {
    case PlatformType.WHATSAPP:
      return 'WhatsApp'
    case PlatformType.WHATSAPP_TWILIO:
      return 'WhatsApp Twilio'
    case PlatformType.TELEGRAM:
      return 'Telegram'
    case PlatformType.INSTAGRAM:
      return 'Instagram'
    default:
      return platform
  }
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'Fecha inválida'
  }
}

const resetDialog = () => {
  confirmationText.value = ''
  showConfirmationError.value = false
  isLoading.value = false
}

const handleCancel = () => {
  emit('update:modelValue', false)
}

const handleConfirm = async () => {
  if (!props.channel) return

  // Validate confirmation text
  if (!isConfirmationValid.value) {
    showConfirmationError.value = true
    return
  }

  isLoading.value = true

  try {
    await channelsService.deleteChannel(props.channel.id)
    emit('deleted', props.channel.id)
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Error deleting channel:', error)
    // Error handling will be done by the parent component
  } finally {
    isLoading.value = false
  }
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    resetDialog()
  }
})

watch(() => confirmationText.value, () => {
  if (showConfirmationError.value) {
    showConfirmationError.value = false
  }
})
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.border-t {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.rounded {
  border-radius: 8px;
}
</style>