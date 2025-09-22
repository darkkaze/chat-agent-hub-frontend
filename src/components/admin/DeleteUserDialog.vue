<!--
Delete User Dialog

Dialog de confirmación para eliminar un usuario
- Mostrar información del usuario a eliminar
- Confirmación de seguridad
- Integración con authService

Props: modelValue (boolean), user (UserResponse | null)
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
            Eliminar Usuario
          </h2>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <div v-if="user">
          <v-alert
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            <div class="text-body-1 font-weight-medium mb-2">
              ¿Estás seguro de que quieres eliminar este usuario?
            </div>
            <div class="text-body-2">
              Esta acción no se puede deshacer. El usuario será removido permanentemente
              del sistema y perderá acceso a todas sus funcionalidades.
            </div>
          </v-alert>

          <!-- User Info -->
          <v-card
            variant="outlined"
            class="mb-4"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-center mb-2">
                <v-icon color="primary" class="mr-2">mdi-account</v-icon>
                <span class="text-body-1 font-weight-medium">{{ user.username }}</span>
              </div>

              <div class="text-body-2 text-on-surface-variant mb-1">
                <strong>Email:</strong> {{ user.email }}
              </div>

              <div class="text-body-2 text-on-surface-variant mb-1">
                <strong>Rol:</strong>
                <v-chip
                  :color="getRoleColor(user.role)"
                  size="small"
                  variant="tonal"
                  class="ml-1"
                >
                  {{ getRoleName(user.role) }}
                </v-chip>
              </div>

              <div class="text-body-2 text-on-surface-variant">
                <strong>Estado:</strong>
                <v-chip
                  :color="user.is_active ? 'success' : 'warning'"
                  size="small"
                  variant="tonal"
                  class="ml-1"
                >
                  {{ user.is_active ? 'Activo' : 'Inactivo' }}
                </v-chip>
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
              <strong>Importante:</strong> Si este usuario tiene datos asociados
              (chats, mensajes, configuraciones), también podrían verse afectados.
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
          Eliminar Usuario
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { authService } from '@/services/auth/authService'
import { UserRole } from '@/types/auth'
import type { UserResponse } from '@/types/auth'

// Props and emits
interface Props {
  modelValue: boolean
  user: UserResponse | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'deleted', userId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const isLoading = ref(false)
const error = ref('')

// Methods
const getRoleName = (role: string) => {
  switch (role) {
    case UserRole.ADMIN:
      return 'Administrador'
    case UserRole.USER:
      return 'Usuario'
    case UserRole.AGENT:
      return 'Agente'
    default:
      return role
  }
}

const getRoleColor = (role: string) => {
  switch (role) {
    case UserRole.ADMIN:
      return 'error'
    case UserRole.USER:
      return 'primary'
    case UserRole.AGENT:
      return 'info'
    default:
      return 'default'
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
  error.value = ''
}

const handleDelete = async () => {
  if (!props.user) return

  isLoading.value = true
  error.value = ''

  try {
    await authService.deleteUser(props.user.id)
    emit('deleted', props.user.id)
    emit('update:modelValue', false)
  } catch (err: any) {
    error.value = err.detail || 'Error al eliminar el usuario. Intenta de nuevo.'
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