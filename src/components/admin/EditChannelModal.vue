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
                prepend-inner-icon="mdi-tag"
                :rules="nameRules"
                required
                autofocus
                hint="Nombre descriptivo para identificar este canal"
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
                hint="La plataforma no se puede modificar después de la creación"
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
            </v-col>

            <!-- API URL -->
            <v-col cols="12">
              <v-text-field
                v-model="formData.api_to_send_message"
                label="API para enviar mensajes (opcional)"
                placeholder="https://api.example.com/send?token={token}&to={phone}&message={message}"
                variant="outlined"
                prepend-inner-icon="mdi-api"
                :rules="apiUrlRules"
                clearable
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
                          :readonly="false"
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
                          :rules="credentialRules[credential.key] || []"
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
                          @click="removeCredential(index)"
                        />
                      </v-col>
                    </v-row>
                  </div>

                  <v-btn
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
  api_to_send_message: '',
  credentials_to_send_message: {}
})

// Original data for change detection
const originalData = ref<UpdateChannelRequest>({
  name: '',
  api_to_send_message: '',
  credentials_to_send_message: {}
})

const credentials = ref<Array<{ key: string; value: string; visible: boolean }>>([])

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
const isTwilioPlatform = computed(() => {
  return props.channel?.platform === PlatformType.WHATSAPP_TWILIO
})

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

const hasChanges = computed(() => {
  return formData.value.name !== originalData.value.name ||
         formData.value.api_to_send_message !== originalData.value.api_to_send_message ||
         JSON.stringify(credentialsObject.value) !== JSON.stringify(originalData.value.credentials_to_send_message)
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

const getStatusDescription = () => {
  if (!props.channel) return ''

  if (props.channel.api_to_send_message) {
    return 'El canal está configurado y puede enviar mensajes'
  } else {
    return 'El canal necesita configuración de API para enviar mensajes'
  }
}

const loadChannelData = async () => {
  if (!props.channel) return

  formData.value = {
    name: props.channel.name,
    api_to_send_message: props.channel.api_to_send_message || '',
    credentials_to_send_message: {}
  }

  originalData.value = {
    name: props.channel.name,
    api_to_send_message: props.channel.api_to_send_message || '',
    credentials_to_send_message: {}
  }

  // Load credentials from secure endpoint
  try {
    const credentialsResponse = await channelsService.getChannelCredentials(props.channel.id)
    const existingCredentials = credentialsResponse.credentials_to_send_message || {}

    // Convert to array format with visibility control
    credentials.value = Object.entries(existingCredentials).map(([key, value]) => ({
      key,
      value: String(value),
      visible: false // Start hidden for security
    }))

    // Update original data for change detection
    originalData.value.credentials_to_send_message = existingCredentials
  } catch (error) {
    console.error('Error loading credentials:', error)
    credentials.value = []
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

    if (JSON.stringify(credentialsObject.value) !== JSON.stringify(originalData.value.credentials_to_send_message)) {
      requestData.credentials_to_send_message = credentialsObject.value
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
  if (newValue && props.channel) {
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