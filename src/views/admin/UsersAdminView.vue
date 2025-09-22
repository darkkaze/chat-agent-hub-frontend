<!--
Users Admin View

Vista de administración de usuarios con CRUD completo:
- Tabla de usuarios existentes
- Crear, editar y eliminar usuarios
- Búsqueda y filtros
- Gestión simple de cuentas

Ruta: /admin/users
-->

<template>
  <div class="admin-view d-flex flex-column h-100">
    <!-- Header -->
    <div class="admin-header px-4 py-3 border-b d-flex align-center justify-space-between">
      <div>
        <h1 class="text-subtitle-1 font-weight-medium mb-1">
          Gestión de Usuarios
        </h1>
        <p class="text-caption text-on-surface-variant">
          Administra las cuentas de usuarios del sistema
        </p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        size="small"
        @click="openCreateModal"
      >
        Agregar Usuario
      </v-btn>
    </div>

    <!-- Search and Filters -->
    <div class="px-4 py-3 border-b">
      <v-row align="center" no-gutters>
        <v-col cols="12" md="5" class="pr-md-3">
          <v-text-field
            v-model="searchQuery"
            placeholder="Buscar usuarios"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" md="3" class="px-md-3">
          <v-select
            v-model="roleFilter"
            :items="roleOptions"
            placeholder="Filtrar por rol"
            variant="outlined"
            density="compact"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" md="2" class="px-md-3">
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
            v-if="filteredUsers.length"
            color="primary"
            variant="outlined"
            size="small"
          >
            {{ filteredUsers.length }} usuario{{ filteredUsers.length === 1 ? '' : 's' }}
          </v-chip>
        </v-col>
      </v-row>
    </div>

    <!-- Content -->
    <div class="admin-content flex-1-1 overflow-hidden">
      <!-- Users Table -->
      <v-data-table
        :headers="tableHeaders"
        :items="filteredUsers"
        :loading="isLoading"
        :no-data-text="noDataText"
        :items-per-page="-1"
        item-key="id"
        class="users-table h-100"
        density="compact"
        hide-default-footer
      >
        <!-- Username column -->
        <template #[`item.username`]="{ item }">
          <div class="d-flex align-center">
            <v-icon
              color="primary"
              class="mr-2"
              size="20"
            >
              mdi-account
            </v-icon>
            <span>{{ item.username }}</span>
          </div>
        </template>

        <!-- Role column -->
        <template #[`item.role`]="{ item }">
          <v-chip
            :color="getRoleColor(item.role)"
            size="small"
            variant="tonal"
          >
            {{ getRoleName(item.role) }}
          </v-chip>
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

        <!-- Actions column -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex gap-1 justify-center">
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              color="primary"
              @click="openEditModal(item)"
            >
              <v-icon>mdi-pencil</v-icon>
              <v-tooltip activator="parent" location="top">
                Editar usuario
              </v-tooltip>
            </v-btn>
            <v-btn
              icon="mdi-lock-reset"
              variant="text"
              size="small"
              color="warning"
              @click="openChangePasswordModal(item)"
            >
              <v-icon>mdi-lock-reset</v-icon>
              <v-tooltip activator="parent" location="top">
                Cambiar contraseña
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
                Eliminar usuario
              </v-tooltip>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Create User Modal -->
    <CreateUserModal
      v-model="showCreateModal"
      @created="handleUserCreated"
    />

    <!-- Edit User Modal -->
    <EditUserModal
      v-model="showEditModal"
      :user="selectedUser"
      @updated="handleUserUpdated"
    />

    <!-- Delete User Dialog -->
    <DeleteUserDialog
      v-model="showDeleteDialog"
      :user="selectedUser"
      @deleted="handleUserDeleted"
    />

    <!-- Change Password Modal -->
    <ChangePasswordModal
      v-model="showChangePasswordModal"
      :user="selectedUser"
      @changed="handlePasswordChanged"
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
import { UserRole } from '@/types/auth'
import type { UserResponse } from '@/types/auth'
import CreateUserModal from '@/components/admin/CreateUserModal.vue'
import EditUserModal from '@/components/admin/EditUserModal.vue'
import DeleteUserDialog from '@/components/admin/DeleteUserDialog.vue'
import ChangePasswordModal from '@/components/admin/ChangePasswordModal.vue'

// State
const users = ref<UserResponse[]>([])
const isLoading = ref(false)
const error = ref('')
const searchQuery = ref('')
const roleFilter = ref<string | null>(null)
const statusFilter = ref<string | null>(null)

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteDialog = ref(false)
const showChangePasswordModal = ref(false)
const selectedUser = ref<UserResponse | null>(null)

// Snackbar states
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')

// Table configuration
const tableHeaders = [
  { title: 'Usuario', key: 'username', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Rol', key: 'role', sortable: true },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' as const }
]

const roleOptions = [
  { title: 'Administrador', value: UserRole.ADMIN },
  { title: 'Usuario', value: UserRole.USER },
  { title: 'Agente', value: UserRole.AGENT }
]

const statusOptions = [
  { title: 'Activo', value: 'active' },
  { title: 'Inactivo', value: 'inactive' }
]

// Computed
const filteredUsers = computed(() => {
  let filtered = [...users.value]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  }

  // Apply role filter
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }

  // Apply status filter
  if (statusFilter.value) {
    const isActive = statusFilter.value === 'active'
    filtered = filtered.filter(user => user.is_active === isActive)
  }

  return filtered
})

const noDataText = computed(() => {
  if (isLoading.value) return 'Cargando...'
  if (error.value) return 'Error al cargar los usuarios'
  if (searchQuery.value || roleFilter.value || statusFilter.value) return 'No se encontraron usuarios con los filtros aplicados'
  return 'No hay usuarios registrados. ¡Agrega el primero!'
})

// Methods
const loadUsers = async () => {
  isLoading.value = true
  error.value = ''

  try {
    users.value = await authService.getUsers()
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Error al cargar los usuarios'
    console.error('Error loading users:', err)
    showNotification('Error al cargar los usuarios', 'error')
  } finally {
    isLoading.value = false
  }
}

const getRoleName = (role: string) => {
  switch (role) {
    case UserRole.ADMIN:
      return 'Administrador'
    case UserRole.USER:
      return 'Usuario'
    case UserRole.AGENT:
      return 'Agente'
    default:
      return role
  }
}

const getRoleColor = (role: string) => {
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

// Modal handlers
const openCreateModal = () => {
  showCreateModal.value = true
}

const openEditModal = (user: UserResponse) => {
  selectedUser.value = user
  showEditModal.value = true
}

const openDeleteDialog = (user: UserResponse) => {
  selectedUser.value = user
  showDeleteDialog.value = true
}

const openChangePasswordModal = (user: UserResponse) => {
  selectedUser.value = user
  showChangePasswordModal.value = true
}

// Event handlers
const handleUserCreated = (user: UserResponse) => {
  users.value.unshift(user)
  showNotification(`Usuario "${user.username}" creado exitosamente`)
}

const handleUserUpdated = (updatedUser: UserResponse) => {
  const index = users.value.findIndex(u => u.id === updatedUser.id)
  if (index !== -1) {
    users.value[index] = updatedUser
  }
  showNotification(`Usuario "${updatedUser.username}" actualizado exitosamente`)
}

const handleUserDeleted = (userId: string) => {
  const deletedUser = users.value.find(u => u.id === userId)
  users.value = users.value.filter(u => u.id !== userId)
  showNotification(`Usuario "${deletedUser?.username}" eliminado exitosamente`)
}

const handlePasswordChanged = (username: string) => {
  showNotification(`Contraseña de "${username}" cambiada exitosamente`)
}

// Lifecycle
onMounted(() => {
  loadUsers()
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

.users-table {
  background: transparent;
}

.users-table :deep(.v-data-table__wrapper) {
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