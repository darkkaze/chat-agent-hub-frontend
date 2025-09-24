<!--
MenuManager Component

Componente para gestión CRUD de elementos de menú del sistema
- Listar todos los menús
- Crear nuevo menú (modal)
- Editar menú existente (modal)
- Eliminar menú (confirmación)
- Solo usuarios ADMIN pueden crear/editar/eliminar
-->

<template>
  <div class="menu-manager h-100">
    <!-- Menu Items Table -->
    <v-data-table
      :headers="headers"
      :items="menuItems"
      :loading="isLoading"
      :no-data-text="noDataText"
      :items-per-page="-1"
      item-key="id"
      class="menu-table h-100"
      density="compact"
      hide-default-footer
    >
        <!-- Icon Column -->
        <template #item.icon="{ item }">
          <div class="d-flex align-center">
            <v-icon
              :icon="item.icon"
              size="24"
              color="primary"
            />
          </div>
        </template>

        <!-- URL Column -->
        <template #item.url="{ item }">
          <v-chip
            size="small"
            variant="tonal"
            color="primary"
          >
            {{ item.url }}
          </v-chip>
        </template>

        <!-- Actions Column -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-2">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="primary"
              @click="openEditDialog(item)"
              :loading="isLoading"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="openDeleteDialog(item)"
              :loading="isLoading"
            />
          </div>
        </template>
      </v-data-table>

    <!-- Create/Edit Dialog -->
    <v-dialog
      v-model="showDialog"
      max-width="600px"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="text-h6">
            {{ isEditing ? 'Editar' : 'Crear' }} Elemento de Menú
          </span>
        </v-card-title>

        <v-card-text>
          <v-form ref="formRef" v-model="isFormValid">
            <v-text-field
              v-model="formData.name"
              label="Nombre del menú"
              placeholder="Mi Aplicación"
              variant="outlined"
              :rules="nameRules"
              required
              class="mb-4"
              hint="Nombre descriptivo que aparecerá en el sidebar"
            />

            <v-text-field
              v-model="formData.icon"
              label="Icono MDI"
              placeholder="mdi-basket"
              variant="outlined"
              :rules="iconRules"
              required
              class="mb-4"
              hint="Nombre del icono MDI (ej: mdi-basket, mdi-analytics)"
            >
              <template #prepend-inner>
                <v-icon v-if="formData.icon && isValidMdiIcon(formData.icon)" :icon="formData.icon" size="20" />
              </template>
            </v-text-field>

            <v-text-field
              v-model="formData.url"
              label="URL de navegación"
              placeholder="/dashboard"
              variant="outlined"
              :rules="urlRules"
              required
              class="mb-4"
              hint="Ruta de navegación (ej: /dashboard, /admin/users)"
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="closeDialog"
            :disabled="isSaving"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="saveMenuItem"
            :loading="isSaving"
            :disabled="!isFormValid"
          >
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog
      v-model="showDeleteDialog"
      max-width="400px"
    >
      <v-card>
        <v-card-title>
          <span class="text-h6">Confirmar Eliminación</span>
        </v-card-title>

        <v-card-text>
          ¿Estás seguro de que deseas eliminar este elemento de menú?
          <br><br>
          <strong>URL:</strong> {{ itemToDelete?.url }}
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="closeDeleteDialog"
            :disabled="isDeleting"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            @click="confirmDelete"
            :loading="isDeleting"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { menuService } from '@/services/menu/menuService'
import type { MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest } from '@/types/menu'
import { COMMON_APP_ICONS, isValidMdiIcon, getIconLabel } from '@/types/menu'
import { useMenuStore } from '@/stores/menu'
import { useAuthStore } from '@/stores/auth'

// Stores
const menuStore = useMenuStore()
const authStore = useAuthStore()

// State
const menuItems = ref<MenuItem[]>([])
const isLoading = ref(false)
const error = ref('')

// Dialog states
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const editingItem = ref<MenuItem | null>(null)
const itemToDelete = ref<MenuItem | null>(null)

// Form states
const formRef = ref()
const isFormValid = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)

const formData = reactive({
  name: '',
  icon: '',
  url: ''
})

// Snackbar states
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')

// Table headers
const headers = [
  { title: 'Icono', key: 'icon', sortable: false, width: '100px' },
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'URL', key: 'url', sortable: true },
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, width: '120px' }
]

// Validation rules
const nameRules = [
  (v: string) => !!v || 'El nombre es requerido',
  (v: string) => v.length >= 2 || 'El nombre debe tener al menos 2 caracteres'
]

const iconRules = [
  (v: string) => !!v || 'El icono es requerido',
  (v: string) => isValidMdiIcon(v) || 'Debe ser un icono MDI válido (formato: mdi-nombre)'
]

const urlRules = [
  (v: string) => !!v || 'La URL es requerida',
  (v: string) => v.startsWith('/') || 'La URL debe comenzar con /'
]

// Computed
const noDataText = computed(() => {
  if (error.value) {
    return error.value
  }
  return 'No hay elementos de menú configurados'
})

// Methods
const showNotification = (message: string, color: 'success' | 'error' = 'success') => {
  snackbarMessage.value = message
  snackbarColor.value = color
  showSnackbar.value = true
}

// Refresh both local table and sidebar cache
const refreshMenusAfterChange = async () => {
  const user = authStore.user
  if (user?.id) {
    try {
      // Refresh the sidebar cache in the menu store
      await menuStore.refreshMenus(user.id)

      // Refresh the local table
      await loadMenuItems()

      console.log('Menús refrescados después de cambio CRUD')
    } catch (err) {
      console.error('Error refreshing menus after change:', err)
    }
  }
}

const loadMenuItems = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const response = await menuService.getMenuItems()
    // El backend puede devolver array directamente o un objeto con wrapper
    menuItems.value = Array.isArray(response) ? response : (response as any).menus || []
  } catch (err: any) {
    console.error('Error loading menu items:', err)
    error.value = err.detail || 'Error al cargar los elementos de menú'
    menuItems.value = [] // Asegurar que siempre sea un array
  } finally {
    isLoading.value = false
  }
}

const openCreateDialog = () => {
  isEditing.value = false
  editingItem.value = null
  formData.name = ''
  formData.icon = ''
  formData.url = ''
  showDialog.value = true
}

const openEditDialog = (item: MenuItem) => {
  isEditing.value = true
  editingItem.value = item
  formData.name = item.name
  formData.icon = item.icon
  formData.url = item.url
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  formData.name = ''
  formData.icon = ''
  formData.url = ''
  editingItem.value = null

  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

const saveMenuItem = async () => {
  if (!isFormValid.value) return

  isSaving.value = true

  try {
    if (isEditing.value && editingItem.value) {
      // Update existing item
      const updateData: UpdateMenuItemRequest = {
        name: formData.name,
        icon: formData.icon,
        url: formData.url
      }
      await menuService.updateMenuItem(editingItem.value.id, updateData)
      showNotification('Elemento de menú actualizado exitosamente')
    } else {
      // Create new item
      const createData: CreateMenuItemRequest = {
        name: formData.name,
        icon: formData.icon,
        url: formData.url
      }
      await menuService.createMenuItem(createData)
      showNotification('Elemento de menú creado exitosamente')
    }

    closeDialog()
    await refreshMenusAfterChange()
  } catch (err: any) {
    showNotification(err.detail || 'Error al guardar el elemento de menú', 'error')
  } finally {
    isSaving.value = false
  }
}

const openDeleteDialog = (item: MenuItem) => {
  itemToDelete.value = item
  showDeleteDialog.value = true
}

const closeDeleteDialog = () => {
  showDeleteDialog.value = false
  itemToDelete.value = null
}

const confirmDelete = async () => {
  if (!itemToDelete.value) return

  isDeleting.value = true

  try {
    await menuService.deleteMenuItem(itemToDelete.value.id)
    showNotification('Elemento de menú eliminado exitosamente')
    closeDeleteDialog()
    await refreshMenusAfterChange()
  } catch (err: any) {
    showNotification(err.detail || 'Error al eliminar el elemento de menú', 'error')
  } finally {
    isDeleting.value = false
  }
}

// Expose methods for parent component
defineExpose({
  openCreateDialog
})

// Initialize
onMounted(() => {
  loadMenuItems()
})
</script>

<style scoped>
.menu-icon-preview {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.menu-icon-preview :deep(svg) {
  width: 100%;
  height: 100%;
  fill: currentColor;
}
</style>