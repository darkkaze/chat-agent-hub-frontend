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
                prepend-inner-icon="mdi-tag"
                :rules="nameRules"
                required
                autofocus
                hint="Nombre descriptivo para identificar este canal"
              />
            </v-col>

            <!-- Platform Selection -->
            <v-col cols="12">
              <v-select
                v-model="formData.platform"
                :items="platformOptions"
                label="Plataforma"
                variant="outlined"
                prepend-inner-icon="mdi-apps"
                :rules="platformRules"
                required
                hint="Selecciona la plataforma de comunicación"
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
                label="API para enviar mensajes (opcional)"
                placeholder="https://api.example.com/send?token={token}&to={phone}&message={message}"
                variant="outlined"
                prepend-inner-icon="mdi-api"
                :rules="apiUrlRules"
                hint="URL del API para enviar mensajes. Puedes usar variables como {token}, {phone}, {message}"
              />
            </v-col>

            <!-- Credentials (Dynamic) -->
            <v-col cols="12">
              <v-card variant="outlined">
                <v-card-title class="text-body-1 py-3">
                  <v-icon start>mdi-key</v-icon>
                  {{ isTwilioPlatform ? 'Credenciales de Twilio (requeridas)' : 'Credenciales (opcional)' }}
                </v-card-title>
                <v-card-text>
                  <p class="text-body-2 text-on-surface-variant mb-4">
                    {{ isTwilioPlatform
                      ? 'Configura las credenciales de tu cuenta de Twilio para WhatsApp Business API.'
                      : 'Define credenciales para autenticación. Si tu API requiere un token, agrégalo aquí como "token".'
                    }}
                  </p>

                  <div v-for="(credential, index) in credentials" :key="index" class="mb-3">
                    <v-row>
                      <v-col cols="4">
                        <v-text-field
                          v-model="credential.key"
                          label="Clave"
                          variant="outlined"
                          density="compact"
                          :readonly="isTwilioPlatform"
                          :placeholder="isTwilioPlatform ? '' : 'token'"
                        />
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          v-model="credential.value"
                          label="Valor"
                          variant="outlined"
                          density="compact"
                          :type="credential.visible ? 'text' : 'password'"
                          :placeholder="getTwilioPlaceholder(credential.key)"
                          :rules="getCredentialRules(credential.key)"
                        />
                      </v-col>
                      <v-col cols="1" class="d-flex align-center">
                        <v-btn
                          :icon="credential.visible ? 'mdi-eye-off' : 'mdi-eye'"
                          size="small"
                          variant="text"
                          color="primary"
                          @click="toggleCredentialVisibility(index)"
                        />
                      </v-col>
                      <v-col cols="1" class="d-flex align-center">
                        <v-btn
                          icon="mdi-delete"
                          size="small"
                          variant="text"
                          color="error"
                          :disabled="isTwilioPlatform"
                          @click="removeCredential(index)"
                        />
                      </v-col>
                    </v-row>
                  </div>

                  <v-btn
                    v-if="!isTwilioPlatform"
                    variant="outlined"
                    prepend-icon="mdi-plus"
                    @click="addCredential"
                    size="small"
                  >
                    Agregar clave:valor
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Info Alert -->
            <v-col cols="12">
              <v-alert
                type="info"
                variant="tonal"
              >
                <div class="text-body-2">
                  <strong>Notas importantes:</strong><br>
                  • Los campos <code>credentials_to_send_message</code> y <code>api_to_send_message</code> son opcionales<br>
                  • Puedes usar variables como <code>{token}</code>, <code>{phone}</code> en la URL si están definidas en credenciales<br>
                  • Si tu API requiere autenticación, define la clave "token" en las credenciales
                </div>
              </v-alert>
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

const credentials = ref<Array<{ key: string; value: string; visible: boolean }>>([])

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

// Platform-specific credential validation
const credentialRules = computed(() => {
  if (isTwilioPlatform.value) {
    return {
      from_number: [(v: string) => !!v || 'El número de Twilio es requerido'],
      user: [(v: string) => !!v || 'El Account SID es requerido'],
      token: [(v: string) => !!v || 'El Auth Token es requerido']
    }
  }
  return {}
})

// Helper function to safely get credential rules
const getCredentialRules = (key: string) => {
  const rules = credentialRules.value as Record<string, any>
  return rules[key] || []
}

const platformRules = [
  (v: string) => !!v || 'La plataforma es requerida'
]

const apiUrlRules = [
  (v: string) => !v || isValidUrl(v) || 'Debe ser una URL válida'
]

// Computed
const isTwilioPlatform = computed(() => {
  return formData.value.platform === PlatformType.WHATSAPP_TWILIO
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

// Credentials management
const addCredential = () => {
  credentials.value.push({ key: '', value: '', visible: false })
}

const removeCredential = (index: number) => {
  credentials.value.splice(index, 1)
}

const toggleCredentialVisibility = (index: number) => {
  credentials.value[index].visible = !credentials.value[index].visible
}

// Initialize Twilio credentials with predefined keys
const initializeTwilioCredentials = () => {
  credentials.value = [
    { key: 'from_number', value: '', visible: false },
    { key: 'user', value: '', visible: false },
    { key: 'token', value: '', visible: false }
  ]
}

// Get placeholder text for Twilio fields
const getTwilioPlaceholder = (key: string): string => {
  if (!isTwilioPlatform.value) {
    return key === 'token' ? 'tu_token_aqui' : 'valor'
  }

  const twilioPlaceholders: Record<string, string> = {
    'from_number': '+1234567890',
    'user': 'tu_account_sid',
    'token': 'tu_auth_token'
  }

  return twilioPlaceholders[key] || 'valor'
}

// Convert credentials to object
const credentialsObject = computed(() => {
  const obj: Record<string, string> = {}
  credentials.value.forEach(cred => {
    if (cred.key && cred.value) {
      obj[cred.key] = cred.value
    }
  })
  return Object.keys(obj).length > 0 ? obj : undefined
})

const resetForm = () => {
  formData.value = {
    name: '',
    platform: '' as PlatformType,
    api_to_send_message: '',
    credentials_to_send_message: {}
  }
  credentials.value = []
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
    if (credentialsObject.value) {
      requestData.credentials_to_send_message = credentialsObject.value
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
watch(() => formData.value.platform, (newPlatform) => {
  if (newPlatform === PlatformType.WHATSAPP_TWILIO) {
    initializeTwilioCredentials()
  } else {
    credentials.value = []
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