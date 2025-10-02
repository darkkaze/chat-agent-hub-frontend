<!--
Channels Admin View

Vista de administración de canales con CRUD completo:
- Tabla de canales existentes
- Crear, editar y eliminar canales
- Búsqueda y filtros

Ruta: /admin/channels
-->

<template>
  <div class="admin-view d-flex flex-column h-100">
    <!-- Header -->
    <div class="admin-header px-4 py-3 border-b d-flex align-center justify-space-between">
      <div>
        <h1 class="text-subtitle-1 font-weight-medium mb-1">
          Gestión de Canales
        </h1>
        <p class="text-caption text-on-surface-variant">
          Administra los canales de comunicación conectados
        </p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        size="small"
        @click="openCreateModal"
      >
        Agregar Canal
      </v-btn>
    </div>

    <!-- Search and Filters -->
    <div class="px-4 py-3 border-b">
      <v-row align="center" no-gutters>
        <v-col cols="12" md="6" class="pr-md-3">
          <v-text-field
            v-model="searchQuery"
            placeholder="Buscar canales"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" md="4" class="px-md-3">
          <v-select
            v-model="platformFilter"
            :items="platformOptions"
            placeholder="Filtrar por plataforma"
            variant="outlined"
            density="compact"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" md="2" class="pl-md-3 text-right">
          <v-chip
            v-if="filteredChannels.length"
            color="primary"
            variant="outlined"
            size="small"
          >
            {{ filteredChannels.length }} canal{{ filteredChannels.length === 1 ? '' : 'es' }}
          </v-chip>
        </v-col>
      </v-row>
    </div>

    <!-- Content -->
    <div class="admin-content flex-1-1 overflow-hidden">
      <!-- Channels Table -->
      <v-data-table
        :headers="tableHeaders"
        :items="filteredChannels"
        :loading="isLoading"
        :no-data-text="noDataText"
        :items-per-page="-1"
        item-key="id"
        class="channels-table h-100"
        density="compact"
        hide-default-footer
      >
          <!-- Platform column -->
          <template #[`item.platform`]="{ item }">
            <div class="d-flex align-center">
              <v-icon
                :color="getPlatformColor(item.platform)"
                class="mr-2"
                size="20"
              >
                {{ getPlatformIcon(item.platform) }}
              </v-icon>
              <span>{{ getPlatformName(item.platform) }}</span>
            </div>
          </template>

          <!-- Status column -->
          <template #[`item.status`]="{ item }">
            <v-chip
              :color="item.api_to_send_message ? 'success' : 'warning'"
              size="small"
              variant="tonal"
            >
              {{ item.api_to_send_message ? 'Activo' : 'Inactivo' }}
            </v-chip>
          </template>


          <!-- Actions column -->
          <template #[`item.actions`]="{ item }">
            <div class="d-flex gap-1 justify-center">
              <v-btn
                icon="mdi-pencil"
                variant="text"
                size="small"
                color="primary"
                @click="openEditModal(item)"
              />
              <v-btn
                icon="mdi-delete"
                variant="text"
                size="small"
                color="error"
                @click="openDeleteDialog(item)"
              />
            </div>
          </template>
        </v-data-table>
    </div>

    <!-- Create Channel Modal -->
    <CreateChannelModal
      v-model="showCreateModal"
      @created="handleChannelCreated"
    />

    <!-- Edit Channel Modal -->
    <EditChannelModal
      v-model="showEditModal"
      :channel="selectedChannel"
      @updated="handleChannelUpdated"
    />

    <!-- Delete Channel Dialog -->
    <DeleteChannelDialog
      v-model="showDeleteDialog"
      :channel="selectedChannel"
      @deleted="handleChannelDeleted"
    />

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
import { ref, computed, onMounted } from 'vue'
import { channelsService } from '@/services/channels/channelsService'
import { PlatformType } from '@/types/api'
import type { ChannelResponse } from '@/types/channels'
import CreateChannelModal from '@/components/admin/CreateChannelModal.vue'
import EditChannelModal from '@/components/admin/EditChannelModal.vue'
import DeleteChannelDialog from '@/components/admin/DeleteChannelDialog.vue'

// State
const channels = ref<ChannelResponse[]>([])
const isLoading = ref(false)
const error = ref('')
const searchQuery = ref('')
const platformFilter = ref<string | null>(null)

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteDialog = ref(false)
const selectedChannel = ref<ChannelResponse | null>(null)

// Snackbar states
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')

// Table configuration
const tableHeaders = [
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Plataforma', key: 'platform', sortable: true },
  { title: 'Estado', key: 'status', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' as const }
]

const platformOptions = [
  { title: 'WhatsApp', value: PlatformType.WHATSAPP },
  { title: 'WhatsApp Twilio', value: PlatformType.WHATSAPP_TWILIO },
  { title: 'WhatsApp WHAPI', value: PlatformType.WHAPI },
  { title: 'Telegram', value: PlatformType.TELEGRAM },
  { title: 'Instagram', value: PlatformType.INSTAGRAM }
]

// Computed
const filteredChannels = computed(() => {
  let filtered = [...channels.value]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(channel =>
      channel.name.toLowerCase().includes(query) ||
      getPlatformName(channel.platform).toLowerCase().includes(query)
    )
  }

  // Apply platform filter
  if (platformFilter.value) {
    filtered = filtered.filter(channel =>
      channel.platform === platformFilter.value
    )
  }

  return filtered
})

const noDataText = computed(() => {
  if (isLoading.value) return 'Cargando...'
  if (error.value) return 'Error al cargar los canales'
  if (searchQuery.value || platformFilter.value) return 'No se encontraron canales con los filtros aplicados'
  return 'No hay canales configurados. ¡Agrega el primero!'
})

// Methods
const loadChannels = async () => {
  isLoading.value = true
  error.value = ''

  try {
    channels.value = await channelsService.getChannels()
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Error al cargar los canales'
    console.error('Error loading channels:', err)
    showNotification('Error al cargar los canales', 'error')
  } finally {
    isLoading.value = false
  }
}

const getPlatformIcon = (platform: PlatformType) => {
  switch (platform) {
    case PlatformType.WHATSAPP:
    case PlatformType.WHATSAPP_TWILIO:
    case PlatformType.WHAPI:
      return 'mdi-whatsapp'
    case PlatformType.TELEGRAM:
      return 'mdi-telegram'
    case PlatformType.INSTAGRAM:
      return 'mdi-instagram'
    default:
      return 'mdi-chat'
  }
}

const getPlatformColor = (platform: PlatformType) => {
  switch (platform) {
    case PlatformType.WHATSAPP:
    case PlatformType.WHATSAPP_TWILIO:
    case PlatformType.WHAPI:
      return 'success'
    case PlatformType.TELEGRAM:
      return 'info'
    case PlatformType.INSTAGRAM:
      return 'purple'
    default:
      return 'primary'
  }
}

const getPlatformName = (platform: PlatformType) => {
  switch (platform) {
    case PlatformType.WHATSAPP:
      return 'WhatsApp'
    case PlatformType.WHATSAPP_TWILIO:
      return 'WhatsApp Twilio'
    case PlatformType.WHAPI:
      return 'WhatsApp WHAPI'
    case PlatformType.TELEGRAM:
      return 'Telegram'
    case PlatformType.INSTAGRAM:
      return 'Instagram'
    default:
      return platform
  }
}


const showNotification = (message: string, color: 'success' | 'error' = 'success') => {
  snackbarMessage.value = message
  snackbarColor.value = color
  showSnackbar.value = true
}

// Modal handlers
const openCreateModal = () => {
  showCreateModal.value = true
}

const openEditModal = (channel: ChannelResponse) => {
  selectedChannel.value = channel
  showEditModal.value = true
}

const openDeleteDialog = (channel: ChannelResponse) => {
  selectedChannel.value = channel
  showDeleteDialog.value = true
}

// Event handlers
const handleChannelCreated = (channel: ChannelResponse) => {
  channels.value.unshift(channel)
  showNotification(`Canal "${channel.name}" creado exitosamente`)
}

const handleChannelUpdated = (updatedChannel: ChannelResponse) => {
  const index = channels.value.findIndex(c => c.id === updatedChannel.id)
  if (index !== -1) {
    channels.value[index] = updatedChannel
  }
  showNotification(`Canal "${updatedChannel.name}" actualizado exitosamente`)
}

const handleChannelDeleted = (channelId: string) => {
  const deletedChannel = channels.value.find(c => c.id === channelId)
  channels.value = channels.value.filter(c => c.id !== channelId)
  showNotification(`Canal "${deletedChannel?.name}" eliminado exitosamente`)
}

// Lifecycle
onMounted(() => {
  loadChannels()
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
  background: rgb(var(--v-theme-surface));
}

.channels-table {
  background: transparent;
}

.channels-table :deep(.v-data-table__wrapper) {
  height: 100%;
}

.border-b {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

/* Remove default padding from v-row in compact mode */
.admin-view :deep(.v-row) {
  margin: 0;
}

.admin-view :deep(.v-col) {
  padding: 0;
}

.admin-view :deep(.v-col.pr-md-3) {
  padding-right: 12px;
}

.admin-view :deep(.v-col.px-md-3) {
  padding-left: 12px;
  padding-right: 12px;
}

.admin-view :deep(.v-col.pl-md-3) {
  padding-left: 12px;
}

@media (max-width: 959px) {
  .admin-view :deep(.v-col) {
    padding: 4px 0;
  }
}
</style>