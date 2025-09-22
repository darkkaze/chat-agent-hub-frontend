<!--
Create Channel Modal

Modal para crear un nuevo canal de comunicación
- Formulario con validación
- Selección de plataforma
- Configuración de API

Props: modelValue (boolean)
Emits: @update:modelValue, @created
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
        <h2 class="text-h5 font-weight-medium">
          Crear Nuevo Canal
        </h2>
      </v-card-title>

      <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSubmit">
        <v-card-text class="pa-6">
          <v-row>
            <!-- Channel Name -->
            <v-col cols="12">
              <v-text-field
                v-model="formData.name"
                label="Nombre del canal"
                placeholder="ej. WhatsApp Principal"
                variant="outlined"
                :rules="nameRules"
                required
                autofocus
              />
            </v-col>

            <!-- Platform Selection -->
            <v-col cols="12">
              <v-select
                v-model="formData.platform"
                :items="platformOptions"
                label="Plataforma"
                variant="outlined"
                :rules="platformRules"
                required
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props" :title="item.title">
                    <template #prepend>
                      <v-icon :color="getPlatformColor(item.value)">
                        {{ getPlatformIcon(item.value) }}
                      </v-icon>
                    </template>
                  </v-list-item>
                </template>

                <template #selection="{ item }">
                  <div class="d-flex align-center">
                    <v-icon
                      :color="getPlatformColor(item.value)"
                      class="mr-2"
                      size="20"
                    >
                      {{ getPlatformIcon(item.value) }}
                    </v-icon>
                    <span>{{ item.title }}</span>
                  </div>
                </template>
              </v-select>
            </v-col>

            <!-- API URL (optional) -->
            <v-col cols="12">
              <v-text-field
                v-model="formData.api_to_send_message"
                label="URL de API (opcional)"
                placeholder="https://api.ejemplo.com/send"
                variant="outlined"
                :rules="apiUrlRules"
              />
              <div class="text-caption text-on-surface-variant mt-1">
                URL del webhook o API para enviar mensajes (si aplica)
              </div>
            </v-col>

            <!-- Platform-specific fields -->
            <v-col v-if="showCredentialsSection" cols="12">
              <v-divider class="mb-4" />
              <h3 class="text-subtitle-1 font-weight-medium mb-4">
                Credenciales de {{ getPlatformName(formData.platform) }}
              </h3>

              <!-- WhatsApp credentials -->
              <template v-if="isWhatsAppPlatform">
                <v-text-field
                  v-model="credentials.access_token"
                  label="Token de acceso"
                  variant="outlined"
                  type="password"
                  class="mb-4"
                />
                <v-text-field
                  v-model="credentials.phone_number_id"
                  label="ID del número de teléfono"
                  variant="outlined"
                  class="mb-4"
                />
              </template>

              <!-- Telegram credentials -->
              <template v-if="formData.platform === PlatformType.TELEGRAM">
                <v-text-field
                  v-model="credentials.bot_token"
                  label="Bot Token"
                  variant="outlined"
                  type="password"
                />
              </template>
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
            :disabled="!isFormValid"
          >
            Crear Canal
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
import type { CreateChannelRequest, ChannelResponse } from '@/types/channels'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'created': [channel: ChannelResponse]
}>()

// Form state
const formRef = ref()
const isFormValid = ref(false)
const isLoading = ref(false)

// Form data
const formData = ref<CreateChannelRequest>({
  name: '',
  platform: '' as PlatformType,
  api_to_send_message: '',
  credentials_to_send_message: {}
})

const credentials = ref<Record<string, string>>({})

// Platform options
const platformOptions = [
  { title: 'WhatsApp', value: PlatformType.WHATSAPP },
  { title: 'WhatsApp Twilio', value: PlatformType.WHATSAPP_TWILIO },
  { title: 'Telegram', value: PlatformType.TELEGRAM },
  { title: 'Instagram', value: PlatformType.INSTAGRAM }
]

// Validation rules
const nameRules = [
  (v: string) => !!v || 'El nombre es requerido',
  (v: string) => v.length >= 3 || 'El nombre debe tener al menos 3 caracteres',
  (v: string) => v.length <= 50 || 'El nombre no puede exceder 50 caracteres'
]

const platformRules = [
  (v: string) => !!v || 'La plataforma es requerida'
]

const apiUrlRules = [
  (v: string) => !v || isValidUrl(v) || 'Debe ser una URL válida'
]

// Computed
const showCredentialsSection = computed(() => {
  return formData.value.platform && formData.value.platform !== PlatformType.INSTAGRAM
})

const isWhatsAppPlatform = computed(() => {
  return formData.value.platform === PlatformType.WHATSAPP ||
         formData.value.platform === PlatformType.WHATSAPP_TWILIO
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

const resetForm = () => {
  formData.value = {
    name: '',
    platform: '' as PlatformType,
    api_to_send_message: '',
    credentials_to_send_message: {}
  }
  credentials.value = {}
  formRef.value?.resetValidation()
}

const handleCancel = () => {
  emit('update:modelValue', false)
}

const handleSubmit = async () => {
  if (!formRef.value?.validate()) return

  isLoading.value = true

  try {
    // Prepare request data
    const requestData: CreateChannelRequest = {
      name: formData.value.name,
      platform: formData.value.platform
    }

    // Add API URL if provided
    if (formData.value.api_to_send_message) {
      requestData.api_to_send_message = formData.value.api_to_send_message
    }

    // Add credentials if any
    if (Object.keys(credentials.value).length > 0) {
      requestData.credentials_to_send_message = { ...credentials.value }
    }

    const newChannel = await channelsService.createChannel(requestData)

    emit('created', newChannel)
    emit('update:modelValue', false)
    resetForm()
  } catch (error) {
    console.error('Error creating channel:', error)
    // Error handling will be done by the parent component
  } finally {
    isLoading.value = false
  }
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})

// Reset credentials when platform changes
watch(() => formData.value.platform, () => {
  credentials.value = {}
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