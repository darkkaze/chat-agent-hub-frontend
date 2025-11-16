/**
 * Tasks Service
 * 
 * Servicio para gestión de tareas, notas y documentos
 * - CRUD de tareas
 * - Gestión de notas de tareas
 * - Gestión de documentos de tareas
 * - Asociación con chats
 * 
 * Endpoints mapeados:
 * - GET /tasks
 * - POST /tasks
 * - GET /tasks/{task_id}
 * - PUT /tasks/{task_id}
 * - DELETE /tasks/{task_id}
 * - POST /tasks/{task_id}/notes
 * - DELETE /tasks/{task_id}/notes/{note_id}
 * - POST /tasks/{task_id}/documents
 * - DELETE /tasks/{task_id}/documents/{document_id}
 */

import { apiService, buildQueryParams } from '@/services/api'
import type {
  TaskResponse,
  TaskDetailResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateTaskNoteRequest,
  NoteResponse,
  CreateTaskDocumentRequest,
  DocumentResponse
} from '@/types/tasks'

export class TasksService {
  // Tasks CRUD
  async getTasks(): Promise<TaskResponse[]> {
    return apiService.get<TaskResponse[]>('/tasks')
  }

  async createTask(taskData: CreateTaskRequest): Promise<TaskResponse> {
    return apiService.post<TaskResponse>('/tasks', taskData)
  }

  async getTask(taskId: string): Promise<TaskDetailResponse> {
    return apiService.get<TaskDetailResponse>(`/tasks/${taskId}`)
  }

  async updateTask(taskId: string, taskData: UpdateTaskRequest): Promise<TaskResponse> {
    return apiService.put<TaskResponse>(`/tasks/${taskId}`, taskData)
  }

  async deleteTask(taskId: string, soft = false): Promise<Record<string, any>> {
    const queryParams = buildQueryParams({ soft })
    return apiService.delete<Record<string, any>>(`/tasks/${taskId}${queryParams}`)
  }

  // Task Notes
  async addTaskNote(taskId: string, noteData: CreateTaskNoteRequest): Promise<NoteResponse> {
    return apiService.post<NoteResponse>(`/tasks/${taskId}/notes`, noteData)
  }

  async deleteTaskNote(taskId: string, noteId: string): Promise<Record<string, any>> {
    return apiService.delete<Record<string, any>>(`/tasks/${taskId}/notes/${noteId}`)
  }

  // Task Documents
  async addTaskDocument(
    taskId: string,
    documentData: CreateTaskDocumentRequest
  ): Promise<DocumentResponse> {
    return apiService.post<DocumentResponse>(`/tasks/${taskId}/documents`, documentData)
  }

  async deleteTaskDocument(
    taskId: string,
    documentId: string
  ): Promise<Record<string, any>> {
    return apiService.delete<Record<string, any>>(`/tasks/${taskId}/documents/${documentId}`)
  }
}

export const tasksService = new TasksService()