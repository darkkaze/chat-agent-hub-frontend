/**
 * Boards Types
 * 
 * Types para gestión de tableros kanban
 * - CRUD de tableros
 * - Columnas de tableros
 */

import type { BaseEntity } from './api'

// Board Types
export interface CreateBoardRequest {
  name: string
  columns: string[]
}

export interface UpdateBoardRequest {
  name?: string
  columns?: string[]
}

export interface BoardResponse extends BaseEntity {
  name: string
  columns: string[]
}

// Board Column
export interface BoardColumn {
  name: string
  order: number
  color?: string
}

// Board with full task details (si se necesita en el futuro)
export interface BoardWithTasks extends BoardResponse {
  tasks: {
    [columnName: string]: any[] // TaskResponse[]
  }
}