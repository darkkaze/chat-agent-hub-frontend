<!--
ChatAgentsTab Component

Tab con gestión de agentes del chat:
- Lista de agentes asignados al chat
- Toggle para activar/desactivar agentes
- Información de cada agente
- Estados de carga y error

Props: channelId (string), chatId (string)
Emits: @agent-updated
-->

<template>
  <div class="chat-agents-tab pa-4">
    <!-- Header -->
    <div class="header-section mb-4">
      <h4 class="text-subtitle-1 font-weight-medium mb-2">Agentes del Chat</h4>
      <p class="text-body-2 text-on-surface-variant mb-0">
        Gestiona qué agentes están activos para este chat específico
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-section d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-section mb-4">
      <v-alert type="error" variant="tonal" class="mb-4">
        {{ error }}
      </v-alert>
      <v-btn variant="outlined" prepend-icon="mdi-refresh" @click="loadAgents">
        Reintentar
      </v-btn>
    </div>

    <!-- Empty State -->
    <div v-else-if="agents.length === 0" class="empty-section text-center pa-6">
      <v-icon size="48" color="on-surface-variant" class="mb-3">
        mdi-robot-outline
      </v-icon>
      <h4 class="text-subtitle-1 text-on-surface-variant mb-2">
        Sin agentes asignados
      </h4>
      <p class="text-body-2 text-on-surface-variant">
        No hay agentes configurados para este chat
      </p>
    </div>

    <!-- Agents List -->
    <div v-else class="agents-list">
      <v-card
        v-for="chatAgent in agents"
        :key="chatAgent.id"
        variant="outlined"
        class="mb-3"
      >
        <v-card-text class="pa-4">
          <div class="d-flex align-center">
            <!-- Agent Avatar -->
            <v-avatar size="40" color="secondary" class="mr-3">
              <v-icon color="white">mdi-robot</v-icon>
            </v-avatar>

            <!-- Agent Info -->
            <div class="flex-1-1 mr-3">
              <div class="d-flex align-center mb-1">
                <h4 class="text-subtitle-2 font-weight-medium mr-2">
                  {{ chatAgent.agent.name }}
                </h4>
                <v-chip
                  :color="getAgentStatusColor(chatAgent.agent)"
                  size="x-small"
                  variant="flat"
                >
                  {{ chatAgent.agent.is_active ? 'Activo' : 'Inactivo' }}
                </v-chip>
              </div>

              <p class="text-caption text-on-surface-variant mb-2">
                ID: {{ chatAgent.agent.id }}
              </p>

              <!-- Agent Configuration -->
              <div class="agent-config">
                <div class="d-flex align-center mb-1">
                  <v-icon size="14" color="on-surface-variant" class="mr-1">
                    mdi-timer-outline
                  </v-icon>
                  <span class="text-caption">
                    Buffer: {{ chatAgent.agent.buffer_time_seconds }}s
                  </span>
                </div>

                <div class="d-flex align-center mb-1">
                  <v-icon size="14" color="on-surface-variant" class="mr-1">
                    mdi-message-outline
                  </v-icon>
                  <span class="text-caption">
                    Historial: {{ chatAgent.agent.history_msg_count }} mensajes
                  </span>
                </div>

                <div v-if="chatAgent.agent.webhook_url" class="d-flex align-center">
                  <v-icon size="14" color="on-surface-variant" class="mr-1">
                    mdi-webhook
                  </v-icon>
                  <span class="text-caption webhook-url">
                    {{ formatWebhookUrl(chatAgent.agent.webhook_url) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Toggle Switch -->
            <div class="toggle-section">
              <v-switch
                :model-value="chatAgent.active"
                :loading="updatingAgents.has(chatAgent.id)"
                :disabled="!chatAgent.agent.is_active || updatingAgents.has(chatAgent.id)"
                color="primary"
                density="compact"
                hide-details
                @update:model-value="$event !== null && toggleAgent(chatAgent, $event)"
              />
              <p class="text-caption text-center mt-1">
                {{ chatAgent.active ? 'Habilitado' : 'Deshabilitado' }}
              </p>
            </div>
          </div>

          <!-- Agent Status Warning -->
          <v-alert
            v-if="!chatAgent.agent.is_active"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-3"
          >
            <template #prepend>
              <v-icon>mdi-alert</v-icon>
            </template>
            Este agente está globalmente inactivo
          </v-alert>
        </v-card-text>
      </v-card>

      <!-- Summary -->
      <v-card variant="tonal" color="primary" class="mt-4">
        <v-card-text class="pa-3">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-information-outline</v-icon>
            <div>
              <p class="text-body-2 font-weight-medium mb-1">
                {{ activeAgentsCount }} de {{ agents.length }} agentes activos
              </p>
              <p class="text-caption mb-0">
                Solo los agentes habilitados responderán en este chat
              </p>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { chatAgentsService } from '@/services/channels/chatAgentsService'
import type { ChatAgentResponse } from '@/types/chatAgents'
import type { AgentResponse } from '@/types/auth'

interface Props {
  channelId: string
  chatId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'agent-updated': [agentId: string, active: boolean]
}>()

// Reactive state
const agents = ref<ChatAgentResponse[]>([])
const isLoading = ref(false)
const error = ref('')
const updatingAgents = ref(new Set<string>())

// Computed
const activeAgentsCount = computed(() => {
  return agents.value.filter(agent => agent.active && agent.agent.is_active).length
})

// Methods
const loadAgents = async () => {
  if (!props.channelId || !props.chatId) return

  isLoading.value = true
  error.value = ''

  try {
    const response = await chatAgentsService.getChatAgents(props.channelId, props.chatId, {
      limit: 50,
      active: undefined // Load both active and inactive
    })
    agents.value = response.chat_agents || []
  } catch (err: any) {
    error.value = err.detail || err.message || 'Error al cargar los agentes'
    console.error('Error loading chat agents:', err)
  } finally {
    isLoading.value = false
  }
}

const toggleAgent = async (chatAgent: ChatAgentResponse, newActive: boolean) => {
  if (!chatAgent.agent.is_active) {
    return // Don't allow toggling inactive global agents
  }

  const agentId = chatAgent.id
  updatingAgents.value.add(agentId)

  try {
    await chatAgentsService.updateChatAgentStatus(
      props.channelId,
      props.chatId,
      chatAgent.agent_id,
      { active: newActive }
    )

    // Update local state
    const agentIndex = agents.value.findIndex(a => a.id === agentId)
    if (agentIndex !== -1) {
      agents.value[agentIndex].active = newActive
    }

    // Emit event
    emitAgentUpdated(chatAgent.agent_id, newActive)

  } catch (err: any) {
    error.value = err.detail || err.message || 'Error al actualizar el agente'
    console.error('Error updating agent status:', err)
  } finally {
    updatingAgents.value.delete(agentId)
  }
}

const getAgentStatusColor = (agent: AgentResponse) => {
  return agent.is_active ? 'success' : 'error'
}

const formatWebhookUrl = (url: string) => {
  try {
    const urlObj = new URL(url)
    return `${urlObj.hostname}${urlObj.pathname}`
  } catch {
    return url.length > 30 ? `${url.substring(0, 30)}...` : url
  }
}

const emitAgentUpdated = (agentId: string, active: boolean) => {
  emit('agent-updated', agentId, active)
}

// Watchers
watch(
  () => [props.channelId, props.chatId],
  ([newChannelId, newChatId]) => {
    if (newChannelId && newChatId) {
      loadAgents()
    }
  }
)

// Lifecycle
onMounted(() => {
  if (props.channelId && props.chatId) {
    loadAgents()
  }
})
</script>

<style scoped>
.chat-agents-tab {
  max-height: 100%;
  overflow-y: auto;
}

.agent-config {
  font-size: 0.75rem;
}

.webhook-url {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toggle-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.v-switch {
  flex-shrink: 0;
}

.empty-section {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>