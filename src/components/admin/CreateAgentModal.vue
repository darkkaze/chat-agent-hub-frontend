<!--
Create Agent Modal

Modal para crear un nuevo agente
- Formulario con validación basado en onboarding
- Configuración completa del agente
- Integración con authService

Props: modelValue (boolean)
Emits: @update:modelValue, @created
-->

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700px"
    persistent
  >
    <v-card>
      <v-card-title class="pa-6 border-b">
        <div class="d-flex align-center">
          <v-icon color="primary" class="mr-3">mdi-robot</v-icon>
          <h2 class="text-h5 font-weight-medium">
            Crear Nuevo Agente
          </h2>
        </div>
      </v-card-title>

      <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSubmit">
        <v-card-text class="pa-6">
          <v-row>
            <!-- Agent Name -->
            <v-col cols="12">
              <v-text-field
                v-model="formData.name"
                label="Nombre del agente"
                placeholder="Ej: Asistente Virtual, Bot de Ventas, Soporte IA"
                variant="outlined"
                prepend-inner-icon="mdi-robot"
                :rules="nameRules"
                required
                autofocus
                hint="Un nombre descriptivo para identificar este agente"
              />
            </v-col>

            <!-- Webhook URL -->
            <v-col cols="12">
              <v-text-field
                v-model="formData.webhook_url"
                label="URL de tu agente (endpoint)"
                placeholder="https://tu-servidor.com/webhook"
                variant="outlined"
                prepend-inner-icon="mdi-api"
                :rules="webhookRules"
                hint="La URL donde recibirás los mensajes para procesar"
              />
            </v-col>

            <!-- Fire and Forget Option -->
            <v-col cols="12">
              <v-checkbox
                v-model="formData.is_fire_and_forget"
                label="Modo Fire & Forget"
                color="primary"
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
            </v-col>

            <!-- Agent Configuration -->
            <v-col cols="12">
              <v-card variant="outlined">
                <v-card-title class="text-body-1 py-3">
                  <v-icon start>mdi-cog</v-icon>
                  Configuración del agente
                </v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model.number="formData.buffer_time_seconds"
                        label="Buffer de tiempo (seg)"
                        type="number"
                        variant="outlined"
                        min="1"
                        max="30"
                        :rules="bufferTimeRules"
                        hint="Tiempo para agrupar mensajes consecutivos"
                        persistent-hint
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model.number="formData.history_msg_count"
                        label="Mensajes de historial"
                        type="number"
                        variant="outlined"
                        min="1"
                        max="100"
                        :rules="historyCountRules"
                        hint="Cantidad de mensajes previos a enviar al agente"
                        persistent-hint
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model.number="formData.recent_msg_window_minutes"
                        label="Ventana reciente (min)"
                        type="number"
                        variant="outlined"
                        min="60"
                        max="10080"
                        :rules="recentWindowRules"
                        hint="Tiempo para considerar mensajes como 'recientes'"
                        persistent-hint
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-checkbox
                        v-model="formData.activate_for_new_conversation"
                        label="Activar para nuevas conversaciones"
                        color="primary"
                        hint="El agente se activará automáticamente para conversaciones nuevas"
                        persistent-hint
                      >
                        <template #append>
                          <v-tooltip activator="parent" location="top">
                            <span>Cuando llega un mensaje de un contacto nuevo, el agente se activa automáticamente.</span>
                          </v-tooltip>
                        </template>
                      </v-checkbox>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Error message -->
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mt-4"
            :text="error"
          />
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
            type="submit"
            color="primary"
            :loading="isLoading"
            :disabled="!isFormValid"
          >
            Crear Agente
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { authService } from '@/services/auth/authService'
import type { CreateAgentRequest, AgentResponse } from '@/types/auth'

// Props and emits
interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', agent: AgentResponse): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Form state
const formRef = ref()
const isFormValid = ref(false)
const isLoading = ref(false)
const error = ref('')

// Form data
const formData = reactive<CreateAgentRequest>({
  name: '',
  webhook_url: '',
  is_fire_and_forget: false,
  buffer_time_seconds: 3,
  history_msg_count: 40,
  recent_msg_window_minutes: 1440, // 60*24 = 1 día
  activate_for_new_conversation: true
})

// Validation rules
const nameRules = [
  (v: string) => !!v || 'El nombre del agente es requerido',
  (v: string) => v.length >= 3 || 'El nombre debe tener al menos 3 caracteres'
]

const webhookRules = [
  (v: string) => {
    if (!v) return true // Optional field
    try {
      new URL(v)
      return true
    } catch {
      return 'Debe ser una URL válida (ej: https://ejemplo.com/webhook)'
    }
  }
]

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

// Methods
const resetForm = () => {
  formData.name = ''
  formData.webhook_url = ''
  formData.is_fire_and_forget = false
  formData.buffer_time_seconds = 3
  formData.history_msg_count = 40
  formData.recent_msg_window_minutes = 1440
  formData.activate_for_new_conversation = true
  error.value = ''

  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  error.value = ''

  try {
    const agent = await authService.createAgent(formData)
    emit('created', agent)
    emit('update:modelValue', false)
    resetForm()
  } catch (err: any) {
    error.value = err.detail || 'Error al crear el agente. Intenta de nuevo.'
  } finally {
    isLoading.value = false
  }
}

// Watch dialog state to reset form when opened
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    resetForm()
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