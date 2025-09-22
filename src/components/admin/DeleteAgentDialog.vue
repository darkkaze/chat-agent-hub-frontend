<!--
Delete Agent Dialog

Dialog de confirmación para eliminar un agente
- Mostrar información del agente a eliminar
- Confirmación de seguridad
- Integración con authService

Props: modelValue (boolean), agent (AgentResponse | null)
Emits: @update:modelValue, @deleted
-->

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500px"
    persistent
  >
    <v-card>
      <v-card-title class="pa-6 border-b">
        <div class="d-flex align-center">
          <v-icon color="error" class="mr-3">mdi-delete</v-icon>
          <h2 class="text-h5 font-weight-medium">
            Eliminar Agente
          </h2>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <div v-if="agent">
          <v-alert
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            <div class="text-body-1 font-weight-medium mb-2">
              ¿Estás seguro de que quieres eliminar este agente?
            </div>
            <div class="text-body-2">
              Esta acción no se puede deshacer. El agente será removido permanentemente
              y dejará de procesar mensajes.
            </div>
          </v-alert>

          <!-- Agent Info -->
          <v-card
            variant="outlined"
            class="mb-4"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-center mb-2">
                <v-icon color="primary" class="mr-2">mdi-robot</v-icon>
                <span class="text-body-1 font-weight-medium">{{ agent.name }}</span>
              </div>

              <div class="text-body-2 text-on-surface-variant mb-1">
                <strong>URL:</strong> {{ agent.webhook_url || 'No configurada' }}
              </div>

              <div class="text-body-2 text-on-surface-variant mb-1">
                <strong>Estado:</strong>
                <v-chip
                  :color="agent.is_active ? 'success' : 'warning'"
                  size="small"
                  variant="tonal"
                  class="ml-1"
                >
                  {{ agent.is_active ? 'Activo' : 'Inactivo' }}
                </v-chip>
              </div>

              <div class="text-body-2 text-on-surface-variant">
                <strong>Modo:</strong> {{ agent.is_fire_and_forget ? 'Fire & Forget' : 'Con respuesta' }}
              </div>
            </v-card-text>
          </v-card>

          <!-- Additional Warning -->
          <v-alert
            type="error"
            variant="outlined"
            class="mb-4"
          >
            <div class="text-body-2">
              <strong>Importante:</strong> Los tokens de acceso asociados a este agente
              también serán revocados automáticamente.
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
        </div>
      </v-card-text>

      <v-card-actions class="pa-6 border-t">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="handleClose"
          :disabled="isLoading"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="error"
          :loading="isLoading"
          @click="handleDelete"
        >
          Eliminar Agente
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { authService } from '@/services/auth/authService'
import type { AgentResponse } from '@/types/auth'

// Props and emits
interface Props {
  modelValue: boolean
  agent: AgentResponse | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'deleted', agentId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const isLoading = ref(false)
const error = ref('')

// Methods
const handleClose = () => {
  emit('update:modelValue', false)
  error.value = ''
}

const handleDelete = async () => {
  if (!props.agent) return

  isLoading.value = true
  error.value = ''

  try {
    await authService.deleteAgent(props.agent.id)
    emit('deleted', props.agent.id)
    emit('update:modelValue', false)
  } catch (err: any) {
    error.value = err.detail || 'Error al eliminar el agente. Intenta de nuevo.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.border-t {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}
</style>