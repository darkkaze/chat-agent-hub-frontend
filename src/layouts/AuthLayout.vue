<!--
AuthLayout Component

Layout para páginas de autenticación (login/signup)
- Centrado en pantalla
- Responsive
- Logo/branding
- Sin navegación
-->

<template>
  <v-app>
    <v-main class="d-flex align-center justify-center min-h-screen bg-grey-lighten-4">
      <v-container class="pa-4">
        <v-row justify="center">
          <v-col cols="12" sm="8" md="5" lg="4" xl="3">
            <v-card 
              class="pa-8 elevation-8 rounded-xl"
              color="surface"
            >
              <!-- Logo/Header -->
              <div class="text-center mb-8">
                <v-avatar size="64" color="primary" class="mb-4">
                  <span class="text-h4 text-white font-weight-bold">A</span>
                </v-avatar>
                <h1 class="text-h4 text-on-surface font-weight-bold mb-2">
                  {{ t('auth.title') }}
                </h1>
                <p class="text-body-2 text-on-surface-variant">
                  {{ t('auth.subtitle') }}
                </p>
              </div>

              <!-- Content slot -->
              <RouterView />
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { t } from '@/i18n'
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
</style>