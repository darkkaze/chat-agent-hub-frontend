<!--
User Config View

Vista de configuración personal del usuario
- Cambiar nombre de usuario
- Cambiar contraseña
- Información básica del perfil

Ruta: /admin/config
-->

<template>
  <div class="admin-view d-flex flex-column h-100">
    <!-- Header -->
    <div class="admin-header px-4 py-3 border-b d-flex align-center">
      <div>
        <h1 class="text-subtitle-1 font-weight-medium mb-1">
          Configuración de Usuario
        </h1>
        <p class="text-caption text-on-surface-variant">
          Administra tu información personal y preferencias
        </p>
      </div>
    </div>

    <!-- Content -->
    <div class="admin-content flex-1-1 overflow-y-auto pa-6">
      <v-row justify="center">
        <v-col cols="12" sm="10" md="8" lg="7" xl="6">
          <v-card
            class="pa-8 elevation-4 rounded-xl"
            color="surface"
          >
            <!-- Header -->
            <div class="text-center mb-6">
              <v-avatar size="64" color="primary" class="mb-4">
                <v-icon size="32" color="white">mdi-account-cog</v-icon>
              </v-avatar>
              <h1 class="text-h5 text-on-surface font-weight-bold mb-2">
                Configuración Personal
              </h1>
            </div>

            <!-- Change Username Section -->
            <v-form ref="usernameFormRef" v-model="isUsernameFormValid" @submit.prevent="handleUsernameChange">
              <h3 class="text-h6 text-on-surface font-weight-medium mb-4">
                <v-icon start color="primary">mdi-account-edit</v-icon>
                Cambiar Nombre de Usuario
              </h3>

              <v-text-field
                v-model="usernameForm.username"
                label="Nuevo nombre de usuario"
                placeholder="Ej: juan.perez"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                :rules="usernameRules"
                required
                class="mb-4"
                hint="Identificador único que usarás para iniciar sesión"
              />

              <!-- Username Error -->
              <v-alert
                v-if="usernameError"
                type="error"
                variant="tonal"
                class="mb-4"
                :text="usernameError"
              />

              <!-- Username Actions -->
              <div class="d-flex gap-3 mb-6">
                <v-btn
                  variant="outlined"
                  @click="resetUsernameForm"
                  :disabled="isUsernameLoading"
                >
                  Cancelar
                </v-btn>
                <v-btn
                  type="submit"
                  color="primary"
                  :loading="isUsernameLoading"
                  :disabled="!isUsernameFormValid || !hasUsernameChanged"
                >
                  Guardar Cambios
                  <v-icon end>mdi-check</v-icon>
                </v-btn>
              </div>
            </v-form>

            <v-divider class="my-6" />

            <!-- Change Password Section -->
            <v-form ref="passwordFormRef" v-model="isPasswordFormValid" @submit.prevent="handlePasswordChange">
              <h3 class="text-h6 text-on-surface font-weight-medium mb-4">
                <v-icon start color="primary">mdi-lock-reset</v-icon>
                Cambiar Contraseña
              </h3>

              <v-text-field
                v-model="passwordForm.password"
                label="Nueva contraseña"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                prepend-inner-icon="mdi-lock"
                :rules="passwordRules"
                required
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

              <v-text-field
                v-model="passwordForm.confirmPassword"
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

              <!-- Password Error -->
              <v-alert
                v-if="passwordError"
                type="error"
                variant="tonal"
                class="mb-4"
                :text="passwordError"
              />

              <!-- Password Actions -->
              <div class="d-flex gap-3">
                <v-btn
                  variant="outlined"
                  @click="resetPasswordForm"
                  :disabled="isPasswordLoading"
                >
                  Cancelar
                </v-btn>
                <v-btn
                  type="submit"
                  color="primary"
                  :loading="isPasswordLoading"
                  :disabled="!isPasswordFormValid"
                >
                  Cambiar Contraseña
                  <v-icon end>mdi-check</v-icon>
                </v-btn>
              </div>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Success/Error Snackbar -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="4000"
      location="top"
    >
      {{ snackbarMessage }}
      <template #actions>
        <v-btn
          variant="text"
          @click="showSnackbar = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth/authService'
import { UserRole } from '@/types/auth'

// Stores
const authStore = useAuthStore()

// State
const currentUser = computed(() => authStore.user)

// Username form
const usernameFormRef = ref()
const isUsernameFormValid = ref(false)
const isUsernameLoading = ref(false)
const usernameError = ref('')

const usernameForm = reactive({
  username: ''
})

// Password form
const passwordFormRef = ref()
const isPasswordFormValid = ref(false)
const isPasswordLoading = ref(false)
const passwordError = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordForm = reactive({
  password: '',
  confirmPassword: ''
})

// Snackbar states
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')

// Validation rules
const usernameRules = [
  (v: string) => !!v || 'El nombre de usuario es requerido',
  (v: string) => v.length >= 3 || 'Debe tener al menos 3 caracteres',
  (v: string) => /^[a-zA-Z0-9._-]+$/.test(v) || 'Solo letras, números, puntos, guiones y guiones bajos'
]

const passwordRules = [
  (v: string) => !!v || 'La nueva contraseña es requerida',
  (v: string) => v.length >= 6 || 'Debe tener al menos 6 caracteres'
]

const confirmPasswordRules = [
  (v: string) => !!v || 'Confirma la nueva contraseña',
  (v: string) => v === passwordForm.password || 'Las contraseñas no coinciden'
]

// Computed
const hasUsernameChanged = computed(() => {
  return usernameForm.username !== currentUser.value?.username
})

// Methods
const getRoleName = (role?: string) => {
  switch (role) {
    case UserRole.ADMIN:
      return 'Administrador'
    case UserRole.USER:
      return 'Usuario'
    case UserRole.AGENT:
      return 'Agente'
    default:
      return role || 'No disponible'
  }
}

const getRoleColor = (role?: string) => {
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

const showNotification = (message: string, color: 'success' | 'error' = 'success') => {
  snackbarMessage.value = message
  snackbarColor.value = color
  showSnackbar.value = true
}

const resetUsernameForm = () => {
  usernameForm.username = currentUser.value?.username || ''
  usernameError.value = ''

  if (usernameFormRef.value) {
    usernameFormRef.value.resetValidation()
  }
}

const resetPasswordForm = () => {
  passwordForm.password = ''
  passwordForm.confirmPassword = ''
  passwordError.value = ''
  showPassword.value = false
  showConfirmPassword.value = false

  if (passwordFormRef.value) {
    passwordFormRef.value.resetValidation()
  }
}

const handleUsernameChange = async () => {
  if (!isUsernameFormValid.value || !currentUser.value) return

  isUsernameLoading.value = true
  usernameError.value = ''

  try {
    const updatedUser = await authService.updateUser(currentUser.value.id, {
      username: usernameForm.username
    })

    // Update auth store with new user data
    authStore.setUser(updatedUser)

    showNotification('Nombre de usuario actualizado exitosamente')
  } catch (err: any) {
    usernameError.value = err.detail || 'Error al actualizar el nombre de usuario. Intenta de nuevo.'
  } finally {
    isUsernameLoading.value = false
  }
}

const handlePasswordChange = async () => {
  if (!isPasswordFormValid.value || !currentUser.value) return

  isPasswordLoading.value = true
  passwordError.value = ''

  try {
    await authService.updateUser(currentUser.value.id, {
      password: passwordForm.password
    })

    showNotification('Contraseña cambiada exitosamente')
    resetPasswordForm()
  } catch (err: any) {
    passwordError.value = err.detail || 'Error al cambiar la contraseña. Intenta de nuevo.'
  } finally {
    isPasswordLoading.value = false
  }
}

// Initialize forms
onMounted(() => {
  resetUsernameForm()
  resetPasswordForm()
})
</script>

<style scoped>
.admin-view {
  height: 100vh;
  background: rgb(var(--v-theme-surface));
}

.admin-header {
  flex-shrink: 0;
  background: rgb(var(--v-theme-surface));
}

.admin-content {
  background: rgb(var(--v-theme-background));
}

.border-b {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.border-t {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}
</style>