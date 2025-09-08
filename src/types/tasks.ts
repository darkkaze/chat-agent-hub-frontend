/**
 * Tasks, Notes and Documents Types
 * 
 * Types para gestión de tareas y su contenido asociado
 * - CRUD de tareas
 * - Notas de tareas
 * - Documentos adjuntos
 * - Relación con chats
 */

import type { BaseEntity } from './api'

// Task Types
export interface CreateTaskRequest {
  title: string
  description?: string
  column: string
  board_id: string
  chat_id?: string
  assigned_user_id?: string
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  column?: string
  assigned_user_id?: string
}

export interface TaskResponse extends BaseEntity {
  title: string
  description?: string
  column: string
  board_id: string
  chat_id?: string
  assigned_user_id?: string
  assigned_user_name?: string
}

export interface TaskDetailResponse extends TaskResponse {
  notes: NoteResponse[]
  documents: DocumentResponse[]
}

// Task Notes Types
export interface CreateTaskNoteRequest {
  content: string
}

export interface NoteResponse extends BaseEntity {
  content: string
  author_id: string
  author_name: string
}

// Task Documents Types
export interface CreateTaskDocumentRequest {
  name: string
  url: string
  type: string
}

export interface DocumentResponse extends BaseEntity {
  name: string
  url: string
  type: string
  size?: number
  author_id: string
  author_name: string
}

// Task Status/Priority (si se requiere en el futuro)
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}