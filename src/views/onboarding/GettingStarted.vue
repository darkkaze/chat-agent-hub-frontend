<!--
Welcome Onboarding View

Primera vista del onboarding después del signup
- Bienvenida al usuario
- Información inicial del sistema
- Preparación para siguiente paso
-->

<template>
  <div class="welcome-container">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <v-card 
          class="pa-8 elevation-4 rounded-xl text-center"
          color="surface"
        >
          <!-- Welcome Icon/Logo -->
          <div class="mb-6">
            <v-avatar size="80" color="primary" class="mb-4">
              <v-icon size="40" color="white">mdi-check-circle</v-icon>
            </v-avatar>
            <h1 class="text-h4 text-on-surface font-weight-bold mb-2">
              ¡Bienvenido a {{ globalsStore.sidebarTitle }}!
            </h1>
            <p class="text-body-1 text-on-surface-variant">
              Tu cuenta ha sido creada exitosamente
            </p>
          </div>

          <!-- Welcome Content -->
          <div class="mb-8">
            <p class="text-body-2 text-on-surface-variant mb-4">
              Te guiaremos a través de 3 pasos esenciales para configurar {{ globalsStore.sidebarTitle }}
              y comenzar a automatizar tus conversaciones.
            </p>
            
            <v-alert
              type="info"
              variant="tonal"
              class="text-start mb-4"
            >
              <strong>Pasos siguientes:</strong><br>
              <strong>1.</strong> Crear tu primer canal de comunicación<br>
              <strong>2.</strong> Configurar tu webhook<br>
              <strong>3.</strong> Crear tu primer agente
            </v-alert>
          </div>

          <!-- FAQ Section -->
          <v-expansion-panels
            variant="accordion"
            class="mb-8"
          >
            <v-expansion-panel
              title="❓ Preguntas Frecuentes"
              text=""
            >
              <template v-slot:text>
                <div class="text-body-2">
                  <div class="mb-4">
                    <strong>¿Qué es un Canal?</strong><br>
                    Un canal es un medio de comunicación como WhatsApp, Instagram, Telegram, etc.
                    Es donde recibes mensajes de tus clientes. Puedes tener múltiples canales
                    conectados a {{ globalsStore.sidebarTitle }} para centralizar todas tus conversaciones.
                  </div>
                  <div class="mb-4">
                    <strong>¿Qué es un Agente?</strong><br>
                    Un agente es un sistema automatizado que procesa los mensajes de tus usuarios. 
                    Puedes crear agentes con herramientas como N8N, Make, Node-RED, o programarlos 
                    en Python, JavaScript, etc. Los agentes responden automáticamente, y tú puedes 
                    intervenir cuando sea necesario.
                  </div>
                  <div>
                    <strong>¿Puedo tener múltiples agentes?</strong><br>
                    ¡Sí! Puedes crear varios agentes y asignar múltiples agentes por conversación. 
                    Cada agente puede especializarse en diferentes tareas o tipos de consultas.
                  </div>
                </div>
              </template>
            </v-expansion-panel>
          </v-expansion-panels>

          <!-- Action Button -->
          <v-btn
            color="primary"
            size="large"
            block
            @click="continueOnboarding"
          >
            Comenzar configuración
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useGlobalsStore } from '@/stores/globals'

const router = useRouter()
const globalsStore = useGlobalsStore()

const continueOnboarding = () => {
  // Navegar al siguiente paso: crear canal
  router.push('/onboarding/create-channel')
}
</script>

<style scoped>
.welcome-container {
  max-width: 100%;
  width: 100%;
}
</style>