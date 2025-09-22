<!--
Manage Tokens Modal

Modal para gestionar los tokens de un agente
- Listar tokens existentes
- Crear nuevos tokens
- Revocar tokens específicos
- Copiar tokens al portapapeles

Props: modelValue (boolean), agent (AgentResponse | null)
Emits: @update:modelValue
-->

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="800px"
    persistent
  >
    <v-card>
      <v-card-title class="pa-6 border-b">
        <div class="d-flex align-center">
          <v-icon color="primary" class="mr-3">mdi-key</v-icon>
          <div>
            <h2 class="text-h5 font-weight-medium">
              Gestionar Tokens
            </h2>
            <p class="text-body-2 text-on-surface-variant mt-1" v-if="agent">
              {{ agent.name }}
            </p>
          </div>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- Token explanation -->
        <v-alert
          type="info"
          variant="tonal"
          class="mb-6"
        >
          <div class="text-body-2">
            <strong>Tokens de acceso al API:</strong> Utiliza estos tokens para que tu agente
            pueda autenticarse y enviar mensajes a través de la plataforma.
            <br><br>
            <strong>Seguridad:</strong> Los tokens solo se muestran completos una vez después
            de su creación. Guárdalos en un lugar seguro.
          </div>
        </v-alert>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="48"
            class="mb-4"
          />
          <p class="text-body-2 text-on-surface-variant">
            Cargando tokens...
          </p>
        </div>

        <!-- Error State -->
        <v-alert
          v-else-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
          :text="error"
        />

        <!-- Tokens List -->
        <div v-else>
          <!-- Create New Token -->
          <div class="mb-6">
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              :loading="isCreating"
              @click="createNewToken"
            >
              Crear Nuevo Token
            </v-btn>
          </div>

          <!-- New Token Display (shown once after creation) -->
          <v-card
            v-if="newToken"
            variant="tonal"
            color="success"
            class="mb-6"
          >
            <v-card-title class="text-body-1 py-3">
              <v-icon start>mdi-check-circle</v-icon>
              ¡Nuevo token creado!
            </v-card-title>
            <v-card-text>
              <div class="text-body-2 mb-3">
                <strong>Importante:</strong> Guarda este token ahora. No podrás verlo de nuevo.
              </div>

              <div class="token-display pa-4 rounded bg-white">
                <div class="d-flex align-center">
                  <code class="flex-1-1 text-body-2 font-weight-medium">
                    {{ newToken.access_token }}
                  </code>
                  <v-btn
                    icon="mdi-content-copy"
                    variant="text"
                    size="small"
                    color="success"
                    class="ml-2"
                    @click="copyToClipboard(newToken.access_token)"
                  />
                </div>
              </div>

              <div class="mt-3 text-caption">
                <strong>Expira:</strong> {{ formatExpirationDate(newToken.expires_at) }}
              </div>

              <v-btn
                variant="outlined"
                size="small"
                class="mt-3"
                @click="newToken = null"
              >
                Entendido, ocultar token
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Existing Tokens -->
          <div v-if="tokens.length > 0">
            <h3 class="text-h6 mb-4">Tokens existentes</h3>

            <v-card
              v-for="(token, index) in tokens"
              :key="index"
              variant="outlined"
              class="mb-3"
            >
              <v-card-text class="pa-4">
                <div class="d-flex align-center justify-space-between">
                  <div class="flex-1-1">
                    <div class="d-flex align-center mb-2">
                      <v-text-field
                        :model-value="token.access_token"
                        :type="visibleTokens.includes(index) ? 'text' : 'password'"
                        readonly
                        variant="outlined"
                        density="compact"
                        class="flex-1-1"
                        hide-details
                      >
                        <template #append-inner>
                          <v-btn
                            :icon="visibleTokens.includes(index) ? 'mdi-eye-off' : 'mdi-eye'"
                            variant="text"
                            size="small"
                            @click="toggleTokenVisibility(index)"
                          />
                          <v-btn
                            icon="mdi-content-copy"
                            variant="text"
                            size="small"
                            color="primary"
                            @click="copyToClipboard(token.access_token)"
                          />
                        </template>
                      </v-text-field>
                    </div>
                    <div class="text-caption text-on-surface-variant">
                      <strong>Expira:</strong> {{ formatExpirationDate(token.expires_at) }}
                    </div>
                  </div>

                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    size="small"
                    color="error"
                    class="ml-2"
                    :loading="revokingTokens.includes(index)"
                    @click="revokeToken(index)"
                  />
                </div>
              </v-card-text>
            </v-card>
          </div>

          <!-- No Tokens State -->
          <v-card
            v-else-if="!newToken"
            variant="outlined"
            class="text-center pa-8"
          >
            <v-icon size="48" color="on-surface-variant" class="mb-4">
              mdi-key-outline
            </v-icon>
            <h3 class="text-h6 mb-2">No hay tokens creados</h3>
            <p class="text-body-2 text-on-surface-variant">
              Crea tu primer token para que el agente pueda acceder al API
            </p>
          </v-card>

          <!-- Copy Success -->
          <v-alert
            v-if="copySuccess"
            type="success"
            variant="tonal"
            class="mt-4"
            text="Token copiado al portapapeles"
          />
        </div>
      </v-card-text>

      <v-card-actions class="pa-6 border-t">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="handleClose"
        >
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { agentTokensService } from '@/services/auth/agentTokensService'
import { formatDateWithTimezone } from '@/config'
import type { AgentResponse, AgentTokenResponse, CreateAgentTokenResponse } from '@/types/auth'

// Props and emits
interface Props {
  modelValue: boolean
  agent: AgentResponse | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const isLoading = ref(false)
const isCreating = ref(false)
const error = ref('')
const tokens = ref<AgentTokenResponse[]>([])
const newToken = ref<CreateAgentTokenResponse | null>(null)
const copySuccess = ref(false)
const revokingTokens = ref<number[]>([])
const visibleTokens = ref<number[]>([])

// Methods
const loadTokens = async () => {
  if (!props.agent) return

  isLoading.value = true
  error.value = ''

  try {
    const response = await agentTokensService.getAgentTokens(props.agent.id)
    tokens.value = response.tokens || []
  } catch (err: any) {
    error.value = err.detail || 'Error al cargar los tokens'
    console.error('Error loading tokens:', err)
  } finally {
    isLoading.value = false
  }
}

const createNewToken = async () => {
  if (!props.agent) return

  isCreating.value = true
  error.value = ''

  try {
    const token = await agentTokensService.createAgentToken(props.agent.id)
    newToken.value = token

    // Reload tokens to show the new one in the list
    await loadTokens()
  } catch (err: any) {
    error.value = err.detail || 'Error al crear el token'
    console.error('Error creating token:', err)
  } finally {
    isCreating.value = false
  }
}

const revokeToken = async (index: number) => {
  if (!props.agent || !tokens.value[index]) return

  revokingTokens.value.push(index)
  error.value = ''

  try {
    // Extract token ID from the token string (assuming it's the token itself for now)
    // This might need adjustment based on how the backend handles token IDs
    const tokenId = tokens.value[index].access_token
    await agentTokensService.revokeAgentToken(props.agent.id, tokenId)

    // Remove from local list
    tokens.value.splice(index, 1)
  } catch (err: any) {
    error.value = err.detail || 'Error al revocar el token'
    console.error('Error revoking token:', err)
  } finally {
    revokingTokens.value = revokingTokens.value.filter(i => i !== index)
  }
}

const copyToClipboard = async (token: string) => {
  try {
    await navigator.clipboard.writeText(token)
    copySuccess.value = true

    // Hide success message after 3 seconds
    setTimeout(() => {
      copySuccess.value = false
    }, 3000)
  } catch (err) {
    console.error('Failed to copy token:', err)
  }
}

const toggleTokenVisibility = (index: number) => {
  const visibleIndex = visibleTokens.value.indexOf(index)
  if (visibleIndex > -1) {
    visibleTokens.value.splice(visibleIndex, 1)
  } else {
    visibleTokens.value.push(index)
  }
}

const formatExpirationDate = (dateString: string) => {
  try {
    return formatDateWithTimezone(dateString, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } catch (error) {
    return 'Fecha no disponible'
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
  newToken.value = null
  error.value = ''
  visibleTokens.value = []
}

// Watch dialog state to load tokens when opened
watch(() => props.modelValue, (newValue) => {
  if (newValue && props.agent) {
    loadTokens()
  }
})

watch(() => props.agent, (newAgent) => {
  if (newAgent && props.modelValue) {
    loadTokens()
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

.token-display {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.token-display code {
  word-break: break-all;
  font-family: 'Courier New', monospace;
  color: rgb(var(--v-theme-on-surface));
}
</style>