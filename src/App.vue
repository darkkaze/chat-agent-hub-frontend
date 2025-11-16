<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useGlobalsStore } from '@/stores/globals'

const authStore = useAuthStore()
const globalsStore = useGlobalsStore()

const isLoadingAuth = computed(() => authStore.isLoading && !authStore.isInitialized)

// Load globals configuration in setup, before components render
if (!globalsStore.isLoaded) {
  globalsStore.loadGlobals().catch((error) => {
    console.error('Failed to load globals in setup:', error)
  })
}

// Watch for changes in project name and update browser title
watch(
  () => globalsStore.projectName,
  (newProjectName) => {
    document.title = `${newProjectName} | Agent Hub`
  }
)

// Set initial title when app mounts
onMounted(() => {
  document.title = globalsStore.browserTitle
})
</script>

<template>
  <!-- Loading screen durante inicialización de auth -->
  <v-app v-if="isLoadingAuth">
    <v-main class="d-flex align-center justify-center min-h-screen">
      <div class="text-center">
        <v-progress-circular
          indeterminate
          size="64"
          color="primary"
          class="mb-4"
        />
        <h2 class="text-h6 text-on-surface">Cargando...</h2>
        <p class="text-body-2 text-on-surface-variant">Verificando autenticación</p>
      </div>
    </v-main>
  </v-app>

  <!-- App normal cuando auth está inicializado -->
  <router-view v-else />
</template>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
</style>
