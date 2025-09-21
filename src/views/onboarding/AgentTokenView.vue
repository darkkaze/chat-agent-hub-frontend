<!--
Agent Token Display View

Vista para mostrar el token del agente recién creado
- Obtiene y muestra el token del agente
- Instrucciones de uso del token
- Funcionalidad de copiar al portapapeles
- Continuar al dashboard
-->

<template>
  <div class="agent-token-container">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" lg="7" xl="6">
        <v-card
          class="pa-8 elevation-4 rounded-xl"
          color="surface"
        >
          <!-- Header -->
          <div class="text-center mb-6">
            <v-avatar size="64" color="success" class="mb-4">
              <v-icon size="32" color="white">mdi-check-circle</v-icon>
            </v-avatar>
            <h1 class="text-h5 text-on-surface font-weight-bold mb-2">
              ¡Agente creado exitosamente!
            </h1>
            <p class="text-body-2 text-on-surface-variant">
              Tu token de acceso al API está listo para usar
            </p>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-8">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
              class="mb-4"
            />
            <p class="text-body-2 text-on-surface-variant">
              Generando tu token de acceso...
            </p>
          </div>

          <!-- Error State -->
          <v-alert
            v-else-if="error"
            type="error"
            variant="tonal"
            class="mb-6"
            :text="error"
          />

          <!-- Token Display -->
          <div v-else-if="agentToken" class="token-section">
            <!-- Token Explanation -->
            <v-card
              variant="tonal"
              color="primary"
              class="mb-6"
            >
              <v-card-title class="text-body-1 py-3">
                <v-icon start>mdi-key</v-icon>
                Token de acceso al API
              </v-card-title>
              <v-card-text>
                <p class="text-body-2 mb-3">
                  <strong>Usa este token para que tu agente pueda:</strong>
                </p>
                <ul class="ml-4 mb-3">
                  <li>Enviar mensajes a través de la plataforma</li>
                  <li>Acceder a toda el API del sistema</li>
                  <li>Procesar webhooks de forma autenticada</li>
                </ul>
                <p class="text-body-2">
                  <strong>Importante:</strong> Guarda este token en un lugar seguro.
                  Solo se muestra una vez por motivos de seguridad.
                </p>
              </v-card-text>
            </v-card>

            <!-- Token Container -->
            <v-card
              variant="outlined"
              class="mb-6"
            >
              <v-card-title class="text-body-1 py-3">
                <v-icon start>mdi-clipboard-text</v-icon>
                Tu token de acceso
              </v-card-title>
              <v-card-text>
                <div class="token-display pa-4 rounded bg-grey-lighten-4">
                  <div class="d-flex align-center">
                    <code class="flex-1-1 text-body-2 font-weight-medium">
                      {{ agentToken.access_token }}
                    </code>
                    <v-btn
                      icon="mdi-content-copy"
                      variant="text"
                      size="small"
                      color="primary"
                      class="ml-2"
                      @click="copyToken"
                    />
                  </div>
                </div>

                <!-- Token Info -->
                <div class="mt-4">
                  <p class="text-caption text-on-surface-variant mb-1">
                    <strong>Expira:</strong> {{ formatExpirationDate(agentToken.expires_at) }}
                  </p>
                  <p class="text-caption text-on-surface-variant">
                    <strong>Formato:</strong> Incluir en headers como
                    <code>Authorization: Bearer {{ agentToken.access_token }}</code>
                  </p>
                </div>
              </v-card-text>
            </v-card>

            <!-- Copy Success -->
            <v-alert
              v-if="copySuccess"
              type="success"
              variant="tonal"
              class="mb-4"
              text="Token copiado al portapapeles"
            />

            <!-- Next Steps -->
            <v-card
              variant="outlined"
              class="mb-6"
            >
              <v-card-title class="text-body-1 py-3">
                <v-icon start>mdi-information-outline</v-icon>
                Próximos pasos
              </v-card-title>
              <v-card-text>
                <div class="text-body-2">
                  <ol class="ml-4">
                    <li class="mb-2">
                      <strong>Guarda tu token</strong> en las variables de entorno de tu agente
                    </li>
                    <li class="mb-2">
                      <strong>Configura tu webhook</strong> para recibir mensajes del sistema
                    </li>
                    <li class="mb-2">
                      <strong>Usa el token</strong> para autenticar las requests de tu agente
                    </li>
                  </ol>
                  <v-alert
                    type="info"
                    variant="tonal"
                    density="compact"
                    class="mt-4"
                  >
                    📚 <strong>Documentación completa del API:</strong>
                    Próximamente agregaremos la documentación detallada con ejemplos de uso.
                  </v-alert>
                </div>
              </v-card-text>
            </v-card>

            <!-- Actions -->
            <div class="text-center">
              <v-btn
                color="primary"
                size="large"
                prepend-icon="mdi-arrow-right"
                @click="continueToDashboard"
              >
                Continuar al Dashboard
              </v-btn>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { agentTokensService } from '@/services/auth/agentTokensService'
import type { AgentTokenResponse } from '@/types/auth'
import { formatDateWithTimezone } from '@/config'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const isLoading = ref(true)
const error = ref('')
const agentToken = ref<AgentTokenResponse | null>(null)
const copySuccess = ref(false)

// Methods
const loadAgentToken = async () => {
  const agentId = route.query.agentId as string

  if (!agentId) {
    error.value = 'ID del agente no encontrado. Redirigiendo...'
    setTimeout(() => {
      router.push('/channel/whatsapp')
    }, 2000)
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const response = await agentTokensService.getAgentTokens(agentId)

    if (response.tokens && response.tokens.length > 0) {
      // Get the first (most recent) token
      agentToken.value = response.tokens[0]
    } else {
      error.value = 'No se encontraron tokens para este agente'
    }
  } catch (err: any) {
    const errorMessage = err?.detail || err?.message || 'Error al obtener el token del agente'
    error.value = errorMessage
    console.error('Error loading agent token:', err)
  } finally {
    isLoading.value = false
  }
}

const copyToken = async () => {
  if (!agentToken.value) return

  try {
    await navigator.clipboard.writeText(agentToken.value.access_token)
    copySuccess.value = true

    // Hide success message after 3 seconds
    setTimeout(() => {
      copySuccess.value = false
    }, 3000)
  } catch (err) {
    console.error('Failed to copy token:', err)
  }
}

const formatExpirationDate = (dateString: string) => {
  try {
    return formatDateWithTimezone(dateString, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } catch (error) {
    return 'Fecha no disponible'
  }
}

const continueToDashboard = () => {
  // Get channel from query params or use default
  const channelId = route.query.channelId as string || 'whatsapp'

  // Save as last visited channel
  authStore.setLastVisitedChannel(channelId)

  // Navigate to the channel
  router.push(`/channel/${channelId}`)
}

// Load token on mount
onMounted(() => {
  loadAgentToken()
})
</script>

<style scoped>
.agent-token-container {
  max-width: 100%;
  width: 100%;
}

.token-display {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

.token-display code {
  word-break: break-all;
  font-family: 'Courier New', monospace;
  color: rgb(var(--v-theme-on-surface));
}

ol {
  list-style-type: decimal;
}

li {
  margin-bottom: 0.5rem;
}
</style>