<!--
Setup Webhook Onboarding View

Vista para configurar el webhook del canal creado
- Explicación del webhook
- URL generada automáticamente
- Funcionalidad copiar al portapapeles
- Instrucciones para servicios externos
-->

<template>
  <div class="setup-webhook-container">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" lg="6" xl="5">
        <v-card 
          class="pa-8 elevation-4 rounded-xl"
          color="surface"
        >
          <!-- Header -->
          <div class="text-center mb-6">
            <v-avatar size="64" color="success" class="mb-4">
              <v-icon size="32" color="white">mdi-webhook</v-icon>
            </v-avatar>
            <h1 class="text-h5 text-on-surface font-weight-bold mb-2">
              Configura tu Webhook
            </h1>
            <p class="text-body-2 text-on-surface-variant">
              Copia esta URL y configúrala en tu servicio (Twilio, Meta Developer, etc.)
            </p>
          </div>

          <!-- Channel Info -->
          <v-alert
            type="info"
            variant="tonal"
            class="mb-6"
          >
            <div class="text-body-2">
              <strong>Canal creado exitosamente:</strong><br>
              <span class="text-primary">{{ channelName }}</span> - {{ getPlatformLabel(channelPlatform) }}
            </div>
          </v-alert>

          <!-- Webhook URL -->
          <div class="mb-6">
            <v-label class="text-body-1 font-weight-medium mb-2">
              URL del Webhook
            </v-label>
            
            <v-text-field
              :model-value="webhookUrl"
              variant="outlined"
              readonly
              prepend-inner-icon="mdi-link-variant"
              :append-inner-icon="copySuccess ? 'mdi-check' : 'mdi-content-copy'"
              :append-inner-color="copySuccess ? 'success' : 'primary'"
              @click:append-inner="copyWebhookUrl"
              class="mb-2"
              density="comfortable"
            />
            
            <p class="text-caption text-on-surface-variant">
              Esta URL recibirá los mensajes y eventos de tu plataforma
            </p>
          </div>

          <!-- Instructions -->
          <v-card
            variant="outlined"
            class="mb-6"
          >
            <v-card-title class="text-body-1 py-3">
              <v-icon start>mdi-information-outline</v-icon>
              Instrucciones de configuración
            </v-card-title>
            <v-card-text>
              <div class="text-body-2">
                <p class="mb-3">
                  <strong>1. Copia la URL del webhook</strong> usando el botón de copiar
                </p>
                <p class="mb-3">
                  <strong>2. Ve a tu servicio externo:</strong>
                </p>
                <ul class="ml-4 mb-3">
                  <li><strong>Twilio:</strong> Console → WhatsApp → Sandbox/Phone Number → Webhook URL</li>
                  <li><strong>Meta (WhatsApp):</strong> Developer Console → WhatsApp → Configuration → Webhook URL</li>
                  <li><strong>Telegram:</strong> Bot API → setWebhook</li>
                  <li><strong>Instagram:</strong> Developer Console → Instagram Basic Display → Webhooks</li>
                </ul>
                <p>
                  <strong>3. Pega la URL</strong> en el campo webhook de tu servicio
                </p>
              </div>
            </v-card-text>
          </v-card>

          <!-- Copy Success Message -->
          <v-alert
            v-if="copySuccess"
            type="success"
            variant="tonal"
            class="mb-4"
            dismissible
            @click:close="copySuccess = false"
          >
            ¡URL copiada al portapapeles exitosamente!
          </v-alert>

          <!-- Error Message -->
          <v-alert
            v-if="copyError"
            type="error"
            variant="tonal"
            class="mb-4"
            dismissible
            @click:close="copyError = false"
          >
            Error al copiar. Selecciona y copia la URL manualmente.
          </v-alert>

          <!-- Actions -->
          <v-row class="mt-4">
            <v-col cols="6">
              <v-btn
                variant="outlined"
                color="on-surface-variant"
                block
                @click="skipWebhookSetup"
              >
                Configurar después
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn
                color="primary"
                block
                @click="continueToAgent"
              >
                Siguiente
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { config } from '@/config'

const router = useRouter()
const route = useRoute()

// State
const copySuccess = ref(false)
const copyError = ref(false)
const channelId = ref('')
const channelName = ref('')
const channelPlatform = ref('')

// Computed webhook URL
const webhookUrl = computed(() => {
  if (!channelId.value) return ''
  const baseUrl = config.apiBaseUrl.replace('//', '//').replace(':8000', ':8000') // Keep current API URL
  return `${baseUrl}/webhooks/inbound/${channelPlatform.value.toLowerCase()}/${channelId.value}`
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

// Copy webhook URL to clipboard
const copyWebhookUrl = async () => {
  try {
    await navigator.clipboard.writeText(webhookUrl.value)
    copySuccess.value = true
    copyError.value = false
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      copySuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    copyError.value = true
    copySuccess.value = false
  }
}

// Navigation
const continueToAgent = () => {
  router.push({
    path: '/onboarding/create-agent',
    query: {
      channelId: channelId.value
    }
  })
}

const skipWebhookSetup = () => {
  router.push({
    path: '/onboarding/create-agent',
    query: {
      channelId: channelId.value
    }
  })
}

// Load channel data from query params or localStorage
onMounted(() => {
  // Try to get data from query params (passed from CreateChannel)
  channelId.value = route.query.channelId as string || ''
  channelName.value = route.query.channelName as string || 'Mi Canal'
  channelPlatform.value = route.query.channelPlatform as string || 'WHATSAPP'
  
  // If no channel ID, redirect back to create channel
  if (!channelId.value) {
    console.warn('No channel ID provided, redirecting to create channel')
    router.push('/onboarding/create-channel')
  }
})
</script>

<style scoped>
.setup-webhook-container {
  max-width: 100%;
  width: 100%;
}

.v-text-field :deep(.v-field__input) {
  font-family: monospace;
  font-size: 0.875rem;
}

ul {
  list-style-type: disc;
}

li {
  margin-bottom: 0.25rem;
}
</style>