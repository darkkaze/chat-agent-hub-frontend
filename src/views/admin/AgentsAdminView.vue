<!--
Agents Admin View

Vista de administración de agentes con CRUD completo:
- Tabla de agentes existentes
- Crear, editar y eliminar agentes
- Gestión de tokens de agentes
- Búsqueda y filtros

Ruta: /admin/agents
-->

<template>
  <div class="admin-view d-flex flex-column h-100">
    <!-- Header -->
    <div class="admin-header px-4 py-3 border-b d-flex align-center justify-space-between">
      <div>
        <h1 class="text-subtitle-1 font-weight-medium mb-1">
          Gestión de Agentes
        </h1>
        <p class="text-caption text-on-surface-variant">
          Administra los agentes de automatización y sus tokens
        </p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        size="small"
        @click="openCreateModal"
      >
        Agregar Agente
      </v-btn>
    </div>

    <!-- Search and Filters -->
    <div class="px-4 py-3 border-b">
      <v-row align="center" no-gutters>
        <v-col cols="12" md="6" class="pr-md-3">
          <v-text-field
            v-model="searchQuery"
            placeholder="Buscar agentes"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" md="4" class="px-md-3">
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            placeholder="Filtrar por estado"
            variant="outlined"
            density="compact"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" md="2" class="pl-md-3 text-right">
          <v-chip
            v-if="filteredAgents.length"
            color="primary"
            variant="outlined"
            size="small"
          >
            {{ filteredAgents.length }} agente{{ filteredAgents.length === 1 ? '' : 's' }}
          </v-chip>
        </v-col>
      </v-row>
    </div>

    <!-- Content -->
    <div class="admin-content flex-1-1 overflow-hidden">
      <!-- Agents Table -->
      <v-data-table
        :headers="tableHeaders"
        :items="filteredAgents"
        :loading="isLoading"
        :no-data-text="noDataText"
        :items-per-page="-1"
        item-key="id"
        class="agents-table h-100"
        density="compact"
        hide-default-footer
      >
        <!-- Name column -->
        <template #[`item.name`]="{ item }">
          <div class="d-flex align-center">
            <v-icon
              color="primary"
              class="mr-2"
              size="20"
            >
              mdi-robot
            </v-icon>
            <span>{{ item.name }}</span>
          </div>
        </template>

        <!-- Webhook URL column -->
        <template #[`item.webhook_url`]="{ item }">
          <span v-if="item.webhook_url" class="text-body-2">
            {{ truncateUrl(item.webhook_url) }}
          </span>
          <span v-else class="text-caption text-on-surface-variant">
            No configurada
          </span>
        </template>

        <!-- Status column -->
        <template #[`item.status`]="{ item }">
          <v-chip
            :color="item.is_active ? 'success' : 'warning'"
            size="small"
            variant="tonal"
          >
            {{ item.is_active ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>


        <!-- Configuration column -->
        <template #[`item.config`]="{ item }">
          <div class="text-caption">
            <div>Buffer: {{ item.buffer_time_seconds }}s</div>
            <div>Historial: {{ item.history_msg_count }} msgs</div>
          </div>
        </template>

        <!-- Actions column -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex gap-1 justify-center">
            <v-btn
              icon="mdi-key"
              variant="text"
              size="small"
              color="info"
              @click="openTokensModal(item)"
            >
              <v-icon>mdi-key</v-icon>
              <v-tooltip activator="parent" location="top">
                Gestionar tokens
              </v-tooltip>
            </v-btn>
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              color="primary"
              @click="openEditModal(item)"
            >
              <v-icon>mdi-pencil</v-icon>
              <v-tooltip activator="parent" location="top">
                Editar agente
              </v-tooltip>
            </v-btn>
            <v-btn
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              @click="openDeleteDialog(item)"
            >
              <v-icon>mdi-delete</v-icon>
              <v-tooltip activator="parent" location="top">
                Eliminar agente
              </v-tooltip>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Create Agent Modal -->
    <CreateAgentModal
      v-model="showCreateModal"
      @created="handleAgentCreated"
    />

    <!-- Edit Agent Modal -->
    <EditAgentModal
      v-model="showEditModal"
      :agent="selectedAgent"
      @updated="handleAgentUpdated"
    />

    <!-- Delete Agent Dialog -->
    <DeleteAgentDialog
      v-model="showDeleteDialog"
      :agent="selectedAgent"
      @deleted="handleAgentDeleted"
    />

    <!-- Manage Tokens Modal -->
    <ManageTokensModal
      v-model="showTokensModal"
      :agent="selectedAgent"
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
import { authService } from '@/services/auth/authService'
import type { AgentResponse } from '@/types/auth'
import CreateAgentModal from '@/components/admin/CreateAgentModal.vue'
import EditAgentModal from '@/components/admin/EditAgentModal.vue'
import DeleteAgentDialog from '@/components/admin/DeleteAgentDialog.vue'
import ManageTokensModal from '@/components/admin/ManageTokensModal.vue'

// State
const agents = ref<AgentResponse[]>([])
const isLoading = ref(false)
const error = ref('')
const searchQuery = ref('')
const statusFilter = ref<string | null>(null)

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteDialog = ref(false)
const showTokensModal = ref(false)
const selectedAgent = ref<AgentResponse | null>(null)

// Snackbar states
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')

// Table configuration
const tableHeaders = [
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Webhook URL', key: 'webhook_url', sortable: false },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Configuración', key: 'config', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' as const }
]

const statusOptions = [
  { title: 'Activo', value: 'active' },
  { title: 'Inactivo', value: 'inactive' }
]

// Computed
const filteredAgents = computed(() => {
  let filtered = [...agents.value]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(agent =>
      agent.name.toLowerCase().includes(query) ||
      (agent.webhook_url && agent.webhook_url.toLowerCase().includes(query))
    )
  }

  // Apply status filter
  if (statusFilter.value) {
    const isActive = statusFilter.value === 'active'
    filtered = filtered.filter(agent => agent.is_active === isActive)
  }

  return filtered
})

const noDataText = computed(() => {
  if (isLoading.value) return 'Cargando...'
  if (error.value) return 'Error al cargar los agentes'
  if (searchQuery.value || statusFilter.value) return 'No se encontraron agentes con los filtros aplicados'
  return 'No hay agentes configurados. ¡Agrega el primero!'
})

// Methods
const loadAgents = async () => {
  isLoading.value = true
  error.value = ''

  try {
    agents.value = await authService.getAgents()
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Error al cargar los agentes'
    console.error('Error loading agents:', err)
    showNotification('Error al cargar los agentes', 'error')
  } finally {
    isLoading.value = false
  }
}

const truncateUrl = (url: string) => {
  if (url.length <= 40) return url
  return url.substring(0, 40) + '...'
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

const openEditModal = (agent: AgentResponse) => {
  selectedAgent.value = agent
  showEditModal.value = true
}

const openDeleteDialog = (agent: AgentResponse) => {
  selectedAgent.value = agent
  showDeleteDialog.value = true
}

const openTokensModal = (agent: AgentResponse) => {
  selectedAgent.value = agent
  showTokensModal.value = true
}

// Event handlers
const handleAgentCreated = (agent: AgentResponse) => {
  agents.value.unshift(agent)
  showNotification(`Agente "${agent.name}" creado exitosamente`)
}

const handleAgentUpdated = (updatedAgent: AgentResponse) => {
  const index = agents.value.findIndex(a => a.id === updatedAgent.id)
  if (index !== -1) {
    agents.value[index] = updatedAgent
  }
  showNotification(`Agente "${updatedAgent.name}" actualizado exitosamente`)
}

const handleAgentDeleted = (agentId: string) => {
  const deletedAgent = agents.value.find(a => a.id === agentId)
  agents.value = agents.value.filter(a => a.id !== agentId)
  showNotification(`Agente "${deletedAgent?.name}" eliminado exitosamente`)
}

// Lifecycle
onMounted(() => {
  loadAgents()
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

.agents-table {
  background: transparent;
}

.agents-table :deep(.v-data-table__wrapper) {
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