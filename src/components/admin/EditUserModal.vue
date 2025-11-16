<!--
Edit User Modal

Modal para editar un usuario existente
- Formulario pre-poblado con datos del usuario
- Sin edición de contraseña
- Validación completa

Props: modelValue (boolean), user (UserResponse | null)
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
          <v-icon color="primary" class="mr-3">mdi-account-edit</v-icon>
          <h2 class="text-h5 font-weight-medium">
            Editar Usuario
          </h2>
        </div>
      </v-card-title>

      <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSubmit">
        <v-card-text class="pa-6">
          <v-row>
            <!-- Username -->
            <v-col cols="12">
              <v-text-field
                v-model="formData.username"
                label="Nombre de usuario"
                placeholder="Ej: juan.perez"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                :rules="usernameRules"
                required
                autofocus
                hint="Identificador único del usuario"
              />
            </v-col>

            <!-- Email -->
            <v-col cols="12">
              <v-text-field
                v-model="formData.email"
                label="Correo electrónico"
                placeholder="juan.perez@empresa.com"
                variant="outlined"
                prepend-inner-icon="mdi-email"
                :rules="emailRules"
                required
                hint="Email del usuario"
              />
            </v-col>

            <!-- Role -->
            <v-col cols="12">
              <v-select
                v-model="formData.role"
                :items="roleOptions"
                label="Rol del usuario"
                variant="outlined"
                prepend-inner-icon="mdi-shield-account"
                :rules="roleRules"
                required
                hint="Permisos que tendrá el usuario"
              />
            </v-col>

            <!-- User Status -->
            <v-col cols="12">
              <v-checkbox
                v-model="formData.is_active"
                label="Usuario activo"
                color="primary"
                hint="Desactivar temporalmente este usuario"
                persistent-hint
              >
                <template #append>
                  <v-tooltip activator="parent" location="top">
                    <span>Un usuario inactivo no puede acceder al sistema hasta que sea reactivado.</span>
                  </v-tooltip>
                </template>
              </v-checkbox>
            </v-col>
          </v-row>

          <!-- Password change notice -->
          <v-alert
            type="info"
            variant="tonal"
            class="mt-4"
          >
            <div class="text-body-2">
              <strong>Nota:</strong> Para cambiar la contraseña del usuario,
              contacta al administrador del sistema o solicita al usuario que
              use la función de recuperación de contraseña.
            </div>
          </v-alert>

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
            Actualizar Usuario
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { authService } from '@/services/auth/authService'
import { UserRole } from '@/types/auth'
import type { UpdateUserRequest, UserResponse } from '@/types/auth'

// Props and emits
interface Props {
  modelValue: boolean
  user: UserResponse | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'updated', user: UserResponse): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Form state
const formRef = ref()
const isFormValid = ref(false)
const isLoading = ref(false)
const error = ref('')

// Form data
const formData = reactive<UpdateUserRequest & { is_active: boolean }>({
  username: '',
  email: '',
  role: UserRole.MEMBER,
  is_active: true
})

// Role options
const roleOptions = [
  { title: 'Miembro', value: UserRole.MEMBER },
  { title: 'Administrador', value: UserRole.ADMIN }
]

// Validation rules
const usernameRules = [
  (v: string) => !!v || 'El nombre de usuario es requerido',
  (v: string) => v.length >= 3 || 'Debe tener al menos 3 caracteres',
  (v: string) => /^[a-zA-Z0-9._-]+$/.test(v) || 'Solo letras, números, puntos, guiones y guiones bajos'
]

const emailRules = [
  (v: string) => !!v || 'El correo electrónico es requerido',
  (v: string) => /.+@.+\..+/.test(v) || 'Debe ser un email válido'
]

const roleRules = [
  (v: string) => !!v || 'El rol es requerido'
]

// Methods
const populateForm = () => {
  if (props.user) {
    formData.username = props.user.username
    formData.email = props.user.email
    formData.role = props.user.role
    formData.is_active = props.user.is_active
  }
  error.value = ''

  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleSubmit = async () => {
  if (!isFormValid.value || !props.user) return

  isLoading.value = true
  error.value = ''

  try {
    const user = await authService.updateUser(props.user.id, formData)
    emit('updated', user)
    emit('update:modelValue', false)
  } catch (err: any) {
    error.value = err.detail || 'Error al actualizar el usuario. Intenta de nuevo.'
  } finally {
    isLoading.value = false
  }
}

// Watch dialog state and user to populate form
watch(() => props.modelValue, (newValue) => {
  if (newValue && props.user) {
    populateForm()
  }
})

watch(() => props.user, (newUser) => {
  if (newUser && props.modelValue) {
    populateForm()
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