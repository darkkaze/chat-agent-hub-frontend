<!--
Change Password Modal

Modal para cambiar la contraseña de un usuario
- Formulario simple con nueva contraseña y confirmación
- Validaciones de seguridad
- Integración con authService

Props: modelValue (boolean), user (UserResponse | null)
Emits: @update:modelValue, @changed
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
          <v-icon color="primary" class="mr-3">mdi-lock-reset</v-icon>
          <div>
            <h2 class="text-h5 font-weight-medium">
              Cambiar Contraseña
            </h2>
            <p class="text-body-2 text-on-surface-variant mt-1" v-if="user">
              {{ user.username }}
            </p>
          </div>
        </div>
      </v-card-title>

      <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSubmit">
        <v-card-text class="pa-6">
          <!-- New Password -->
          <v-text-field
            v-model="formData.password"
            label="Nueva contraseña"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            prepend-inner-icon="mdi-lock"
            :rules="passwordRules"
            required
            autofocus
            class="mb-4"
            hint="Mínimo 6 caracteres"
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

          <!-- Confirm Password -->
          <v-text-field
            v-model="confirmPassword"
            label="Confirmar contraseña"
            :type="showConfirmPassword ? 'text' : 'password'"
            variant="outlined"
            prepend-inner-icon="mdi-lock-check"
            :rules="confirmPasswordRules"
            required
            class="mb-4"
            hint="Repite la nueva contraseña"
          >
            <template #append-inner>
              <v-btn
                :icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                variant="text"
                size="small"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </v-text-field>

          <!-- Info Alert -->
          <v-alert
            type="info"
            variant="tonal"
            class="mb-4"
          >
            <div class="text-body-2">
              <strong>Importante:</strong> El usuario deberá usar esta nueva contraseña
              en su próximo inicio de sesión.
            </div>
          </v-alert>

          <!-- Error message -->
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
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
            Cambiar Contraseña
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { authService } from '@/services/auth/authService'
import type { UserResponse } from '@/types/auth'

// Props and emits
interface Props {
  modelValue: boolean
  user: UserResponse | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'changed', username: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Form state
const formRef = ref()
const isFormValid = ref(false)
const isLoading = ref(false)
const error = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const confirmPassword = ref('')

// Form data
const formData = reactive({
  password: ''
})

// Validation rules
const passwordRules = [
  (v: string) => !!v || 'La nueva contraseña es requerida',
  (v: string) => v.length >= 6 || 'Debe tener al menos 6 caracteres'
]

const confirmPasswordRules = [
  (v: string) => !!v || 'Confirma la nueva contraseña',
  (v: string) => v === formData.password || 'Las contraseñas no coinciden'
]

// Methods
const resetForm = () => {
  formData.password = ''
  confirmPassword.value = ''
  error.value = ''
  showPassword.value = false
  showConfirmPassword.value = false

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
    await authService.updateUser(props.user.id, { password: formData.password })
    emit('changed', props.user.username)
    emit('update:modelValue', false)
    resetForm()
  } catch (err: any) {
    error.value = err.detail || 'Error al cambiar la contraseña. Intenta de nuevo.'
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