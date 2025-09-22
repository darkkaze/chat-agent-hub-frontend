<!--
ChatDetailsView Component

Panel lateral simplificado con información esencial del chat:
- Nombre del contacto
- ID Externo (teléfono)
- Fecha de creación

Ruta: /channel/:channelId/chat/:chatId/details
Props: channelId y chatId vienen del router
Emits: @close-details
-->

<template>
  <div class="chat-details-view">
    <!-- Header -->
    <div class="details-header">
      <h3 class="text-h6 font-weight-medium">Detalles del Chat</h3>
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        @click="$router.go(-1)"
      />
    </div>

    <v-divider />

    <!-- Content -->
    <div class="details-content">
      <!-- Contact Info -->
      <div class="contact-section">
        <div class="contact-header">
          <v-avatar size="56" color="primary" class="mb-3">
            <span class="text-h5 font-weight-bold text-white">
              {{ contactInitials }}
            </span>
          </v-avatar>
          <h4 class="text-h6 font-weight-medium mb-1">
            {{ contactName }}
          </h4>
        </div>
      </div>

      <!-- Essential Info -->
      <div class="info-section">
        <div class="info-item">
          <div class="info-label">
            <v-icon size="20" color="on-surface-variant" class="mr-2">
              mdi-phone
            </v-icon>
            <span class="text-body-2 text-on-surface-variant">ID Externo</span>
          </div>
          <div class="info-value">
            <span class="text-body-1">{{ externalId }}</span>
          </div>
        </div>

        <div class="info-item">
          <div class="info-label">
            <v-icon size="20" color="on-surface-variant" class="mr-2">
              mdi-calendar
            </v-icon>
            <span class="text-body-2 text-on-surface-variant">Creado</span>
          </div>
          <div class="info-value">
            <span class="text-body-1">{{ formattedCreatedDate }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Mock data - en el futuro esto vendrá de un store o API
const chatData = ref({
  name: 'Martin Quinta',
  external_id: '+521833159166',
  created_at: '2025-09-19T19:54:23.425131+00:00'
})

const contactName = computed(() => chatData.value.name || 'Sin nombre')

const contactInitials = computed(() => {
  const name = contactName.value
  if (!name || name === 'Sin nombre') return '?'

  const words = name.split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const externalId = computed(() => chatData.value.external_id || 'No disponible')

const formattedCreatedDate = computed(() => {
  if (!chatData.value.created_at) return 'No disponible'

  const date = new Date(chatData.value.created_at)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

onMounted(() => {
  // TODO: Cargar datos reales del chat usando chatId del router
  console.log('Chat ID:', route.params.chatId)
  console.log('Channel ID:', route.params.channelId)
})
</script>

<style scoped>
.chat-details-view {
  height: 100vh;
  background: rgb(var(--v-theme-surface));
  border-left: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  width: 300px;
  display: flex;
  flex-direction: column;
}

.details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgb(var(--v-theme-surface));
}

.details-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.contact-section {
  margin-bottom: 24px;
}

.contact-header {
  text-align: center;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  display: flex;
  align-items: center;
}

.info-value {
  padding-left: 28px;
}

/* Responsive adjustments */
@media (max-width: 959px) {
  .chat-details-view {
    width: 100vw;
  }
}
</style>