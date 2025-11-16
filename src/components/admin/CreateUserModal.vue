<!--
Create User Modal

Modal para crear un nuevo usuario
- Formulario simple con username, email, password, rol
- Validaciones básicas
- Integración con authService

Props: modelValue (boolean)
Emits: @update:modelValue, @created
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
          <v-icon color="primary" class="mr-3">mdi-account-plus</v-icon>
          <h2 class="text-h5 font-weight-medium">
            Crear Nuevo Usuario
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

            <!-- Password -->
            <v-col cols="12">
              <v-text-field
                v-model="formData.password"
                label="Contraseña"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                prepend-inner-icon="mdi-lock"
                :rules="passwordRules"
                required
                hint="Contraseña inicial del usuario"
              >
                <template #append-inner>
                  <v-btn
                    :icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    variant="text"
                    size="small"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </v-text-field>
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
            Crear Usuario
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
import type { CreateUserRequest, UserResponse } from '@/types/auth'

// Props and emits
interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', user: UserResponse): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Form state
const formRef = ref()
const isFormValid = ref(false)
const isLoading = ref(false)
const error = ref('')
const showPassword = ref(false)

// Form data
const formData = reactive<CreateUserRequest>({
  username: '',
  email: '',
  password: '',
  role: UserRole.MEMBER
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

const passwordRules = [
  (v: string) => !!v || 'La contraseña es requerida',
  (v: string) => v.length >= 6 || 'Debe tener al menos 6 caracteres'
]

const roleRules = [
  (v: string) => !!v || 'El rol es requerido'
]

// Methods
const resetForm = () => {
  formData.username = ''
  formData.email = ''
  formData.password = ''
  formData.role = UserRole.MEMBER
  error.value = ''
  showPassword.value = false

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
    const user = await authService.createUser(formData)
    emit('created', user)
    emit('update:modelValue', false)
    resetForm()
  } catch (err: any) {
    error.value = err.detail || 'Error al crear el usuario. Intenta de nuevo.'
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