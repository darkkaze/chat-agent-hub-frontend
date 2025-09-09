<!--
LoginView Component

Vista de login para usuarios existentes
- Formulario de email/password
- Validación
- Manejo de errores
- Integración con authService
-->

<template>
  <div>
    <v-form ref="form" v-model="isValid" @submit.prevent="handleLogin">
      <h2 class="text-h5 text-center mb-6 text-on-surface">
        {{ t('login.title') }}
      </h2>

      <!-- Email field -->
      <v-text-field
        v-model="credentials.username"
        :label="t('login.email')"
        type="email"
        variant="outlined"
        prepend-inner-icon="mdi-email"
        :rules="emailRules"
        :error-messages="fieldErrors.username"
        class="mb-4"
        required
        autocomplete="email"
      />

      <!-- Password field -->
      <v-text-field
        v-model="credentials.password"
        :label="t('login.password')"
        :type="showPassword ? 'text' : 'password'"
        variant="outlined"
        prepend-inner-icon="mdi-lock"
        :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append-inner="showPassword = !showPassword"
        :rules="passwordRules"
        :error-messages="fieldErrors.password"
        class="mb-4"
        required
        autocomplete="current-password"
      />

      <!-- Error message -->
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-4"
        :text="error"
      />

      <!-- Submit button -->
      <v-btn
        type="submit"
        color="primary"
        size="large"
        block
        :loading="isLoading"
        :disabled="!isValid"
        class="mb-4"
      >
        {{ t('login.submit') }}
      </v-btn>

    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/auth/authService'
import { useAuthStore } from '@/stores/auth'
import { t } from '@/i18n'
import type { LoginRequest } from '@/types/auth'

const router = useRouter()
const authStore = useAuthStore()

// Form state
const form = ref()
const isValid = ref(false)
const isLoading = ref(false)
const showPassword = ref(false)
const error = ref('')

// Form data
const credentials = reactive<LoginRequest>({
  username: '',
  password: ''
})

// Field errors
const fieldErrors = reactive({
  username: [] as string[],
  password: [] as string[]
})

// Validation rules
const emailRules = [
  (v: string) => !!v || t('validation.emailRequired'),
  (v: string) => /.+@.+\..+/.test(v) || t('validation.emailInvalid')
]

const passwordRules = [
  (v: string) => !!v || t('validation.passwordRequired'),
  (v: string) => v.length >= 6 || t('validation.passwordMinLength', { min: 6 })
]

// Handle login
const handleLogin = async () => {
  if (!isValid.value) return

  isLoading.value = true
  error.value = ''
  fieldErrors.username = []
  fieldErrors.password = []

  try {
    const loginResponse = await authService.login(credentials)
    
    // Actualizar store con datos del usuario
    await authStore.login(loginResponse.user, loginResponse.access_token)
    
    // Redirect to last visited channel
    const lastChannel = authStore.getLastVisitedChannel()
    router.push(`/channel/${lastChannel}`)
  } catch (err: any) {
    error.value = err.detail || t('error.loginFailed')
  } finally {
    isLoading.value = false
  }
}
</script>