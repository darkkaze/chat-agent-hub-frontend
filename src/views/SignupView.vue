<!--
SignupView Component

Vista de registro para primer usuario del sistema
- Formulario completo de usuario
- Validación avanzada
- Solo se muestra si no hay usuarios
- Crea usuario admin automáticamente
-->

<template>
  <div>
    <v-form ref="form" v-model="isValid" @submit.prevent="handleSignup">
      <h2 class="text-h5 text-center mb-6 text-on-surface">
        {{ t('signup.title') }}
      </h2>

      <p class="text-body-2 text-center mb-6 text-on-surface-variant">
        {{ t('signup.subtitle') }}
      </p>

      <!-- Username field -->
      <v-text-field
        v-model="userData.username"
        :label="t('signup.username')"
        variant="outlined"
        prepend-inner-icon="mdi-account"
        :rules="usernameRules"
        :error-messages="fieldErrors.username"
        class="mb-4"
        required
        autocomplete="username"
      />

      <!-- Email field -->
      <v-text-field
        v-model="userData.email"
        :label="t('signup.email')"
        type="email"
        variant="outlined"
        prepend-inner-icon="mdi-email"
        :rules="emailRules"
        :error-messages="fieldErrors.email"
        class="mb-4"
        required
        autocomplete="email"
      />

      <!-- Password field -->
      <v-text-field
        v-model="userData.password"
        :label="t('signup.password')"
        :type="showPassword ? 'text' : 'password'"
        variant="outlined"
        prepend-inner-icon="mdi-lock"
        :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append-inner="showPassword = !showPassword"
        :rules="passwordRules"
        :error-messages="fieldErrors.password"
        class="mb-4"
        required
        autocomplete="new-password"
      />

      <!-- Confirm Password field -->
      <v-text-field
        v-model="confirmPassword"
        :label="t('signup.confirmPassword')"
        :type="showConfirmPassword ? 'text' : 'password'"
        variant="outlined"
        prepend-inner-icon="mdi-lock-check"
        :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append-inner="showConfirmPassword = !showConfirmPassword"
        :rules="confirmPasswordRules"
        class="mb-4"
        required
        autocomplete="new-password"
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
        {{ t('signup.submit') }}
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
import type { SignupRequest } from '@/types/auth'

const router = useRouter()
const authStore = useAuthStore()

// Form state
const form = ref()
const isValid = ref(false)
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const error = ref('')
const confirmPassword = ref('')

// Form data
const userData = reactive<SignupRequest>({
  username: '',
  email: '',
  password: ''
})

// Field errors
const fieldErrors = reactive({
  username: [] as string[],
  email: [] as string[],
  password: [] as string[]
})

// Validation rules
const usernameRules = [
  (v: string) => !!v || t('validation.usernameRequired'),
  (v: string) => v.length >= 3 || t('validation.usernameMinLength'),
  (v: string) => /^[a-zA-Z0-9_]+$/.test(v) || t('validation.usernameFormat')
]

const emailRules = [
  (v: string) => !!v || t('validation.emailRequired'),
  (v: string) => /.+@.+\..+/.test(v) || t('validation.emailInvalid')
]

const passwordRules = [
  (v: string) => !!v || t('validation.passwordRequired'),
  (v: string) => v.length >= 8 || t('validation.passwordMinLength', { min: 8 }),
  (v: string) => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v) || t('validation.passwordStrong')
]

const confirmPasswordRules = [
  (v: string) => !!v || t('validation.confirmPassword'),
  (v: string) => v === userData.password || t('validation.passwordsMatch')
]

// Handle signup
const handleSignup = async () => {
  if (!isValid.value) return

  isLoading.value = true
  error.value = ''
  fieldErrors.username = []
  fieldErrors.email = []
  fieldErrors.password = []

  try {
    const signupResponse = await authService.signup(userData)
    
    // Actualizar store con datos del usuario
    await authStore.login(signupResponse.user, signupResponse.access_token)
    
    // Redirect to onboarding
    router.push('/onboarding/getting-started')
  } catch (err: any) {
    error.value = err.detail || t('error.signupFailed')
  } finally {
    isLoading.value = false
  }
}
</script>