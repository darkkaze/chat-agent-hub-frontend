<!--
Edit Channel Modal

Modal para editar un canal existente
- Pre-llena el formulario con datos existentes
- Campos editables limitados (no plataforma)
- Validación de datos

Props: modelValue (boolean), channel (ChannelResponse | null)
Emits: @update:modelValue, @updated
-->

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600px"
    persistent
  >
    <v-card>
      <v-card-title class="pa-6 border-b">
        <div class="d-flex align-center">
          <v-icon
            :color="getPlatformColor(channel?.platform)"
            class="mr-3"
            size="24"
          >
            {{ getPlatformIcon(channel?.platform) }}
          </v-icon>
          <div>
            <h2 class="text-h5 font-weight-medium">
              Editar Canal
            </h2>
            <p class="text-body-2 text-on-surface-variant mb-0">
              {{ channel?.name }}
            </p>
          </div>
        </div>
      </v-card-title>

      <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSubmit">
        <v-card-text class="pa-6">
          <v-row>
            <!-- Channel Name -->
            <v-col cols="12">
              <v-text-field
                v-model="formData.name"
                label="Nombre del canal"
                variant="outlined"
                :rules="nameRules"
                required
                autofocus
              />
            </v-col>

            <!-- Platform (readonly) -->
            <v-col cols="12">
              <v-text-field
                :model-value="getPlatformName(channel?.platform)"
                label="Plataforma"
                variant="outlined"
                readonly
                disabled
              >
                <template #prepend-inner>
                  <v-icon
                    :color="getPlatformColor(channel?.platform)"
                    size="20"
                  >
                    {{ getPlatformIcon(channel?.platform) }}
                  </v-icon>
                </template>
              </v-text-field>
              <div class="text-caption text-on-surface-variant mt-1">
                La plataforma no se puede modificar después de la creación
              </div>
            </v-col>

            <!-- API URL -->
            <v-col cols="12">
              <v-text-field
                v-model="formData.api_to_send_message"
                label="URL de API"
                placeholder="https://api.ejemplo.com/send"
                variant="outlined"
                :rules="apiUrlRules"
                clearable
              />
              <div class="text-caption text-on-surface-variant mt-1">
                URL del webhook o API para enviar mensajes
              </div>
            </v-col>

            <!-- Current Status -->
            <v-col cols="12">
              <v-card variant="tonal" color="info" class="pa-4">
                <div class="d-flex align-center">
                  <v-icon class="mr-3">mdi-information</v-icon>
                  <div>
                    <div class="font-weight-medium">Estado actual</div>
                    <div class="text-body-2">
                      <v-chip
                        :color="channel?.api_to_send_message ? 'success' : 'warning'"
                        size="small"
                        variant="flat"
                        class="mr-2"
                      >
                        {{ channel?.api_to_send_message ? 'Activo' : 'Inactivo' }}
                      </v-chip>
                      {{ getStatusDescription() }}
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
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
            color="primary"
            type="submit"
            :loading="isLoading"
            :disabled="!isFormValid || !hasChanges"
          >
            Guardar Cambios
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { channelsService } from '@/services/channels/channelsService'
import { PlatformType } from '@/types/api'
import type { UpdateChannelRequest, ChannelResponse } from '@/types/channels'

interface Props {
  modelValue: boolean
  channel: ChannelResponse | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'updated': [channel: ChannelResponse]
}>()

// Form state
const formRef = ref()
const isFormValid = ref(false)
const isLoading = ref(false)

// Form data
const formData = ref<UpdateChannelRequest>({
  name: '',
  api_to_send_message: ''
})

// Original data for change detection
const originalData = ref<UpdateChannelRequest>({
  name: '',
  api_to_send_message: ''
})

// Validation rules
const nameRules = [
  (v: string) => !!v || 'El nombre es requerido',
  (v: string) => v.length >= 3 || 'El nombre debe tener al menos 3 caracteres',
  (v: string) => v.length <= 50 || 'El nombre no puede exceder 50 caracteres'
]

const apiUrlRules = [
  (v: string) => !v || isValidUrl(v) || 'Debe ser una URL válida'
]

// Computed
const hasChanges = computed(() => {
  return formData.value.name !== originalData.value.name ||
         formData.value.api_to_send_message !== originalData.value.api_to_send_message
})

// Methods
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const getPlatformIcon = (platform?: PlatformType) => {
  if (!platform) return 'mdi-chat'

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

const getPlatformColor = (platform?: PlatformType) => {
  if (!platform) return 'primary'

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

const getPlatformName = (platform?: PlatformType) => {
  if (!platform) return ''

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

const getStatusDescription = () => {
  if (!props.channel) return ''

  if (props.channel.api_to_send_message) {
    return 'El canal está configurado y puede enviar mensajes'
  } else {
    return 'El canal necesita configuración de API para enviar mensajes'
  }
}

const loadChannelData = () => {
  if (!props.channel) return

  formData.value = {
    name: props.channel.name,
    api_to_send_message: props.channel.api_to_send_message || ''
  }

  originalData.value = {
    name: props.channel.name,
    api_to_send_message: props.channel.api_to_send_message || ''
  }
}

const handleCancel = () => {
  emit('update:modelValue', false)
}

const handleSubmit = async () => {
  if (!formRef.value?.validate() || !props.channel) return

  isLoading.value = true

  try {
    const requestData: UpdateChannelRequest = {}

    // Only include fields that have changed
    if (formData.value.name !== originalData.value.name) {
      requestData.name = formData.value.name
    }

    if (formData.value.api_to_send_message !== originalData.value.api_to_send_message) {
      requestData.api_to_send_message = formData.value.api_to_send_message || undefined
    }

    const updatedChannel = await channelsService.updateChannel(props.channel.id, requestData)

    emit('updated', updatedChannel)
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Error updating channel:', error)
    // Error handling will be done by the parent component
  } finally {
    isLoading.value = false
  }
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    loadChannelData()
  }
})

watch(() => props.channel, () => {
  if (props.modelValue) {
    loadChannelData()
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
</style>