/**
 * Menu Service - Gestión de elementos de menú del sistema
 *
 * Available methods:
 * - getMenuItems(): Obtener todos los elementos del menú
 * - getMenuItem(menuId): Obtener elemento específico por ID
 * - createMenuItem(data): Crear nuevo elemento (solo ADMIN)
 * - updateMenuItem(menuId, data): Actualizar elemento (solo ADMIN)
 * - deleteMenuItem(menuId): Eliminar elemento (solo ADMIN)
 *
 * Note: Solo usuarios con rol ADMIN pueden crear, editar o eliminar elementos.
 * Usuarios normales pueden consultar la lista de elementos.
 *
 * Endpoints mapeados:
 * - GET /menu/ - Listar elementos
 * - POST /menu/ - Crear elemento (ADMIN only)
 * - GET /menu/{menu_id} - Obtener elemento específico
 * - PUT /menu/{menu_id} - Actualizar elemento (ADMIN only)
 * - DELETE /menu/{menu_id} - Eliminar elemento (ADMIN only)
 */

import { apiService } from '@/services/api'
import type {
  MenuItem,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  MenuApiResponse,
  MenuItemApiResponse
} from '@/types/menu'
import type { ApiMessageResponse } from '@/types/api'

export class MenuService {
  // Obtener todos los elementos del menú
  async getMenuItems(): Promise<MenuItem[]> {
    const response = await apiService.get<MenuItem[]>('/menu/')
    return response
  }

  // Obtener elemento específico por ID
  async getMenuItem(menuId: string): Promise<MenuItem> {
    const response = await apiService.get<MenuItem>(`/menu/${menuId}`)
    return response
  }

  // Crear nuevo elemento (solo ADMIN)
  async createMenuItem(data: CreateMenuItemRequest): Promise<MenuItem> {
    const response = await apiService.post<MenuItem>('/menu/', data)
    return response
  }

  // Actualizar elemento existente (solo ADMIN)
  async updateMenuItem(menuId: string, data: UpdateMenuItemRequest): Promise<MenuItem> {
    const response = await apiService.put<MenuItem>(`/menu/${menuId}`, data)
    return response
  }

  // Eliminar elemento (solo ADMIN)
  async deleteMenuItem(menuId: string): Promise<ApiMessageResponse> {
    const response = await apiService.delete<ApiMessageResponse>(`/menu/${menuId}`)
    return response
  }
}

// Exportar instancia singleton
export const menuService = new MenuService()