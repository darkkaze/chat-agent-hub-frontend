<!--
Create Channel Onboarding View

Vista para crear el primer canal durante el onboarding
- Explicación de qué es un canal
- Formulario para crear canal
- Soporte para diferentes plataformas
- Campos opcionales con ayuda
-->

<template>
  <div class="create-channel-container">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" lg="6" xl="5">
        <v-card 
          class="pa-8 elevation-4 rounded-xl"
          color="surface"
        >
          <!-- Header -->
          <div class="text-center mb-6">
            <v-avatar size="64" color="primary" class="mb-4">
              <v-icon size="32" color="white">mdi-chat-processing</v-icon>
            </v-avatar>
            <h1 class="text-h5 text-on-surface font-weight-bold mb-2">
              Crear tu primer canal
            </h1>
            <p class="text-body-2 text-on-surface-variant">
              Un canal es un medio de comunicación como WhatsApp, Instagram, Telegram, etc.
            </p>
          </div>

          <!-- Form -->
          <v-form ref="form" v-model="isValid" @submit.prevent="handleCreateChannel">
            <!-- Channel Name -->
            <v-text-field
              v-model="channelData.name"
              label="Nombre del canal"
              variant="outlined"
              prepend-inner-icon="mdi-tag"
              :rules="nameRules"
              class="mb-4"
              required
              placeholder="Ej: Mi WhatsApp Business"
              hint="Nombre descriptivo para identificar este canal"
            />

            <!-- Platform Selection -->
            <v-select
              v-model="channelData.platform"
              label="Plataforma"
              variant="outlined"
              prepend-inner-icon="mdi-apps"
              :items="platformOptions"
              item-title="label"
              item-value="value"
              :rules="platformRules"
              :loading="isLoadingPlatforms"
              :disabled="isLoadingPlatforms || platformOptions.length === 0"
              class="mb-4"
              required
              hint="Selecciona la plataforma de comunicación"
            />

            <!-- Platform loading error -->
            <v-alert
              v-if="platformsError"
              type="warning"
              variant="tonal"
              class="mb-4"
              :text="platformsError"
              dismissible
              @click:close="platformsError = ''"
            />

            <!-- API URL (Optional) -->
            <v-text-field
              v-model="channelData.api_to_send_message"
              label="API para enviar mensajes (opcional)"
              variant="outlined"
              prepend-inner-icon="mdi-api"
              class="mb-2"
              placeholder="https://api.example.com/send?token={token}&to={phone}&message={message}"
              hint="URL del API para enviar mensajes. Puedes usar variables como {token}, {phone}, {message}"
            />

            <!-- Advanced Settings -->
            <v-card
              variant="outlined"
              class="mb-4"
            >
              <v-card-title class="text-body-1 py-3">
                <v-icon start>mdi-cog</v-icon>
                Configuración avanzada
              </v-card-title>
              <v-card-text>
                <v-text-field
                  v-model.number="channelData.buffer_time_seconds"
                  label="Buffer de tiempo (seg)"
                  type="number"
                  variant="outlined"
                  min="1"
                  max="30"
                  :rules="bufferTimeRules"
                  hint="Tiempo para agrupar mensajes consecutivos"
                  persistent-hint
                  class="mb-4"
                />
                
                <v-text-field
                  v-model.number="channelData.history_msg_count"
                  label="Mensajes de historial"
                  type="number"
                  variant="outlined"
                  min="1"
                  max="100"
                  :rules="historyCountRules"
                  hint="Cantidad de mensajes previos a enviar al agente"
                  persistent-hint
                  class="mb-4"
                />
                
                <v-text-field
                  v-model.number="channelData.recent_msg_window_minutes"
                  label="Ventana reciente (min)"
                  type="number"
                  variant="outlined"
                  min="60"
                  max="10080"
                  :rules="recentWindowRules"
                  hint="Tiempo para considerar mensajes como 'recientes'"
                  persistent-hint
                />
              </v-card-text>
            </v-card>

            <!-- Credentials (Optional) -->
            <v-card
              variant="outlined"
              class="mb-4"
            >
              <v-card-title class="text-body-1 py-3">
                <v-icon start>mdi-key</v-icon>
                Credenciales (opcional)
              </v-card-title>
              <v-card-text>
                <p class="text-body-2 text-on-surface-variant mb-4">
                  Define credenciales para autenticación. Si tu API requiere un token, agrégalo aquí como "token".
                </p>
                
                <div v-for="(credential, index) in credentials" :key="index" class="mb-3">
                  <v-row>
                    <v-col cols="5">
                      <v-text-field
                        v-model="credential.key"
                        label="Clave"
                        variant="outlined"
                        density="compact"
                        placeholder="token"
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model="credential.value"
                        label="Valor"
                        variant="outlined"
                        density="compact"
                        :type="credential.key === 'token' ? 'password' : 'text'"
                        placeholder="tu_token_aqui"
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

            <!-- Info Alert -->
            <v-alert
              type="info"
              variant="tonal"
              class="mb-6"
            >
              <div class="text-body-2">
                <strong>Notas importantes:</strong><br>
                • Los campos <code>credentials_to_send_message</code> y <code>api_to_send_message</code> son opcionales<br>
                • Puedes usar variables como <code>{token}</code>, <code>{phone}</code> en la URL si están definidas en credenciales<br>
                • Si tu API requiere autenticación, define la clave "token" en las credenciales<br><br>
                <strong>Configuración avanzada:</strong><br>
                • <strong>Buffer de tiempo:</strong> Agrupa mensajes consecutivos del usuario en este período<br>
                • <strong>Mensajes de historial:</strong> Cantidad de mensajes previos que se envían al agente para contexto<br>
                • <strong>Ventana reciente:</strong> Solo mensajes dentro de este tiempo se consideran para el historial
              </div>
            </v-alert>

            <!-- Error message -->
            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              class="mb-4"
              :text="error"
            />

            <!-- Actions -->
            <v-btn
              type="submit"
              color="primary"
              size="large"
              block
              :loading="isLoading"
              :disabled="!isValid"
              class="mt-4"
            >
              Crear canal
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { channelsService } from '@/services/channels/channelsService'
import { PlatformType } from '@/types/api'
import type { CreateChannelRequest } from '@/types/channels'

const router = useRouter()

// Form state
const form = ref()
const isValid = ref(false)
const isLoading = ref(false)
const isLoadingPlatforms = ref(false)
const error = ref('')
const platformsError = ref('')

// Form data
const channelData = reactive<CreateChannelRequest>({
  name: '',
  platform: PlatformType.WHATSAPP,
  credentials_to_send_message: undefined,
  api_to_send_message: '',
  buffer_time_seconds: 3,
  history_msg_count: 40,
  recent_msg_window_minutes: 1440 // 60*24 = 1 día
})

// Credentials management
const credentials = ref<Array<{key: string, value: string}>>([])

// Platform options
const availablePlatforms = ref<string[]>([])
const platformOptions = computed(() => {
  return availablePlatforms.value.map(platform => ({
    label: getPlatformLabel(platform),
    value: platform
  }))
})

// Platform label mapping
const getPlatformLabel = (platform: string): string => {
  const labels: Record<string, string> = {
    'WHATSAPP': 'WhatsApp',
    'WHATSAPP_TWILIO': 'WhatsApp (Twilio)',
    'TELEGRAM': 'Telegram',
    'INSTAGRAM': 'Instagram'
  }
  return labels[platform] || platform
}

// Validation rules
const nameRules = [
  (v: string) => !!v || 'El nombre del canal es requerido',
  (v: string) => v.length >= 3 || 'El nombre debe tener al menos 3 caracteres'
]

const platformRules = [
  (v: string) => !!v || 'Selecciona una plataforma'
]

// Validation rules for advanced settings
const bufferTimeRules = [
  (v: number) => v >= 1 || 'Debe ser al menos 1 segundo',
  (v: number) => v <= 30 || 'Máximo 30 segundos'
]

const historyCountRules = [
  (v: number) => v >= 1 || 'Debe ser al menos 1 mensaje',
  (v: number) => v <= 100 || 'Máximo 100 mensajes'
]

const recentWindowRules = [
  (v: number) => v >= 60 || 'Debe ser al menos 60 minutos (1 hora)',
  (v: number) => v <= 10080 || 'Máximo 10080 minutos (7 días)'
]

// Credentials methods
const addCredential = () => {
  credentials.value.push({ key: '', value: '' })
}

const removeCredential = (index: number) => {
  credentials.value.splice(index, 1)
}

// Convert credentials to object
const credentialsObject = computed(() => {
  const obj: Record<string, any> = {}
  credentials.value.forEach(cred => {
    if (cred.key && cred.value) {
      obj[cred.key] = cred.value
    }
  })
  return Object.keys(obj).length > 0 ? obj : undefined
})

// Handle form submission
const handleCreateChannel = async () => {
  if (!isValid.value) return

  isLoading.value = true
  error.value = ''

  try {
    // Prepare channel data
    const requestData: CreateChannelRequest = {
      name: channelData.name,
      platform: channelData.platform,
      credentials_to_send_message: credentialsObject.value,
      api_to_send_message: channelData.api_to_send_message || undefined,
      buffer_time_seconds: channelData.buffer_time_seconds,
      history_msg_count: channelData.history_msg_count,
      recent_msg_window_minutes: channelData.recent_msg_window_minutes
    }

    const channel = await channelsService.createChannel(requestData)
    
    // Continue to webhook setup with channel data
    router.push({
      path: '/onboarding/setup-webhook',
      query: {
        channelId: channel.id,
        channelName: channel.name,
        channelPlatform: channel.platform
      }
    })
  } catch (err: any) {
    error.value = err.detail || 'Error al crear el canal. Intenta de nuevo.'
  } finally {
    isLoading.value = false
  }
}


// Load platforms on component mount
const loadPlatforms = async () => {
  isLoadingPlatforms.value = true
  platformsError.value = ''
  
  try {
    availablePlatforms.value = await channelsService.getPlatforms()
    
    // Set default platform if available
    if (availablePlatforms.value.length > 0 && !channelData.platform) {
      channelData.platform = availablePlatforms.value[0] as any
    }
  } catch (err: any) {
    platformsError.value = 'Error al cargar plataformas disponibles'
    console.error('Error loading platforms:', err)
    
    // Fallback to hardcoded platforms
    availablePlatforms.value = ['WHATSAPP', 'WHATSAPP_TWILIO', 'TELEGRAM', 'INSTAGRAM']
    channelData.platform = PlatformType.WHATSAPP
  } finally {
    isLoadingPlatforms.value = false
  }
}

onMounted(() => {
  loadPlatforms()
})
</script>

<style scoped>
.create-channel-container {
  max-width: 100%;
  width: 100%;
}

code {
  background-color: rgba(var(--v-theme-on-surface), 0.1);
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 0.875rem;
}
</style>