<!--
Create Agent Onboarding View

Vista para crear el primer agente durante el onboarding
- Explicación detallada de qué es un agente
- Características automáticas de la plataforma
- Formulario para crear agente
- Opción de saltar esta etapa
-->

<template>
  <div class="create-agent-container">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" lg="7" xl="6">
        <v-card 
          class="pa-8 elevation-4 rounded-xl"
          color="surface"
        >
          <!-- Header -->
          <div class="text-center mb-6">
            <v-avatar size="64" color="secondary" class="mb-4">
              <v-icon size="32" color="white">mdi-robot</v-icon>
            </v-avatar>
            <h1 class="text-h5 text-on-surface font-weight-bold mb-2">
              Crear tu primer agente
            </h1>
            <p class="text-body-2 text-on-surface-variant">
              Los agentes procesan automáticamente los mensajes de tus usuarios
            </p>
          </div>

          <!-- Agent Explanation -->
          <v-card
            variant="outlined"
            class="mb-6"
          >
            <v-card-title class="text-body-1 py-3">
              <v-icon start>mdi-information-outline</v-icon>
              ¿Qué es un agente?
            </v-card-title>
            <v-card-text>
              <div class="text-body-2">
                <p class="mb-3">
                  Un <strong>agente</strong> es un sistema que procesa automáticamente los mensajes de tus usuarios. 
                  Esta plataforma actúa como <strong>intermediario y respaldo</strong>, ofreciendo una interfaz 
                  donde un humano puede relevar a los agentes cuando sea necesario.
                </p>
                <p class="mb-3">
                  El <strong>core de esta plataforma es usar agentes</strong>. Puedes crear tus agentes con:
                </p>
                <ul class="ml-4 mb-3">
                  <li>N8N, Make, Node-RED</li>
                  <li>Programación (Python + LangChain, etc.)</li>
                  <li>Cualquier tecnología que prefieras</li>
                </ul>
                <p>
                  Solo dinos <strong>a dónde enviarte el mensaje</strong> y nosotros nos encargamos del resto.
                </p>
              </div>
            </v-card-text>
          </v-card>

          <!-- Platform Features -->
          <v-card
            variant="tonal"
            color="primary"
            class="mb-6"
          >
            <v-card-title class="text-body-1 py-3">
              <v-icon start>mdi-star</v-icon>
              Lo que hacemos por ti automáticamente
            </v-card-title>
            <v-card-text>
              <div class="text-body-2">
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="d-flex mb-3">
                      <v-icon color="primary" class="mr-2">mdi-buffer</v-icon>
                      <div>
                        <strong>Buffer de mensajes:</strong><br>
                        <span class="text-on-surface-variant">
                          Agrupamos mensajes consecutivos del mismo cliente
                        </span>
                      </div>
                    </div>
                    <div class="d-flex mb-3">
                      <v-icon color="primary" class="mr-2">mdi-microphone-message</v-icon>
                      <div>
                        <strong>Speech-to-text:</strong><br>
                        <span class="text-on-surface-variant">
                          Convertimos notas de voz a texto automáticamente
                        </span>
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="d-flex mb-3">
                      <v-icon color="primary" class="mr-2">mdi-history</v-icon>
                      <div>
                        <strong>Historial automático:</strong><br>
                        <span class="text-on-surface-variant">
                          Te enviamos los últimos N mensajes de la conversación
                        </span>
                      </div>
                    </div>
                    <div class="d-flex mb-3">
                      <v-icon color="primary" class="mr-2">mdi-account-multiple</v-icon>
                      <div>
                        <strong>Múltiples agentes:</strong><br>
                        <span class="text-on-surface-variant">
                          Puedes crear varios agentes y asignar múltiples por chat
                        </span>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>

          <!-- Create Agent Form -->
          <v-form ref="form" v-model="isValid" @submit.prevent="handleCreateAgent">
            <h3 class="text-h6 text-on-surface font-weight-medium mb-4">
              Crear tu primer agente
            </h3>

            <!-- Agent Name -->
            <v-text-field
              v-model="agentData.name"
              label="Nombre del agente"
              variant="outlined"
              prepend-inner-icon="mdi-robot"
              :rules="nameRules"
              class="mb-4"
              required
              placeholder="Ej: Asistente Virtual, Bot de Ventas, Soporte IA"
              hint="Un nombre descriptivo para identificar este agente"
            />

            <!-- Callback URL -->
            <v-text-field
              v-model="agentData.callback_url"
              label="URL de tu agente (endpoint)"
              variant="outlined"
              prepend-inner-icon="mdi-api"
              :rules="callbackRules"
              class="mb-4"
              required
              placeholder="https://tu-servidor.com/webhook"
              hint="La URL donde recibirás los mensajes para procesar"
            />

            <!-- Fire and Forget Option -->
            <v-checkbox
              v-model="agentData.is_fire_and_forget"
              label="Modo Fire & Forget"
              color="primary"
              class="mb-4"
              hint="Si está activado, no esperamos respuesta de tu agente"
              persistent-hint
            >
              <template #append>
                <v-tooltip activator="parent" location="top">
                  <span>En modo Fire & Forget enviamos el mensaje pero no esperamos respuesta. 
                  Útil para agentes que solo procesan/analizan sin responder.</span>
                </v-tooltip>
              </template>
            </v-checkbox>

            <!-- Channel Association -->
            <v-alert
              type="info"
              variant="tonal"
              class="mb-4"
            >
              <div class="text-body-2">
                <strong>Canal asociado:</strong> Este agente se asociará automáticamente 
                al canal que acabas de crear para procesar sus mensajes.
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
            <v-row class="mt-4">
              <v-col cols="6">
                <v-btn
                  variant="outlined"
                  color="on-surface-variant"
                  block
                  @click="skipAgentCreation"
                >
                  Crear después
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn
                  type="submit"
                  color="secondary"
                  block
                  :loading="isLoading"
                  :disabled="!isValid"
                >
                  Crear agente
                  <v-icon end>mdi-check</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authService } from '@/services/auth/authService'
import { useAuthStore } from '@/stores/auth'
import type { CreateAgentRequest } from '@/types/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Form state
const form = ref()
const isValid = ref(false)
const isLoading = ref(false)
const error = ref('')
const channelId = ref('')

// Form data
const agentData = reactive<CreateAgentRequest>({
  name: '',
  callback_url: '',
  is_fire_and_forget: false,
  channel_id: ''
})

// Validation rules
const nameRules = [
  (v: string) => !!v || 'El nombre del agente es requerido',
  (v: string) => v.length >= 3 || 'El nombre debe tener al menos 3 caracteres'
]

const callbackRules = [
  (v: string) => !!v || 'La URL del agente es requerida',
  (v: string) => {
    try {
      new URL(v)
      return true
    } catch {
      return 'Debe ser una URL válida (ej: https://ejemplo.com/webhook)'
    }
  }
]

// Handle agent creation
const handleCreateAgent = async () => {
  if (!isValid.value) return

  isLoading.value = true
  error.value = ''

  try {
    // Set channel ID
    agentData.channel_id = channelId.value

    const agent = await authService.createAgent(agentData)
    
    // Guardar el canal como último visitado
    if (channelId.value) {
      authStore.setLastVisitedChannel(channelId.value)
    }
    
    // Complete onboarding - redirect to the created channel
    router.push(`/channel/${channelId.value}`)
  } catch (err: any) {
    error.value = err.detail || 'Error al crear el agente. Intenta de nuevo.'
  } finally {
    isLoading.value = false
  }
}

// Skip agent creation
const skipAgentCreation = () => {
  // Complete onboarding - redirect to the created channel or default
  const targetChannel = channelId.value || 'whatsapp'
  
  // Guardar el canal como último visitado
  authStore.setLastVisitedChannel(targetChannel)
  
  router.push(`/channel/${targetChannel}`)
}

// Load channel data
onMounted(() => {
  // Try to get channel ID from query params or previous step
  channelId.value = route.query.channelId as string || ''
  
  // If no channel ID, we can still proceed but warn
  if (!channelId.value) {
    console.warn('No channel ID provided for agent creation')
    // Could redirect to create channel or continue without association
  }
})
</script>

<style scoped>
.create-agent-container {
  max-width: 100%;
  width: 100%;
}

ul {
  list-style-type: disc;
}

li {
  margin-bottom: 0.25rem;
}
</style>