/**
 * Boards Service
 * 
 * Servicio para gestión de tableros kanban
 * - CRUD de tableros
 * - Gestión de columnas
 * 
 * Endpoints mapeados:
 * - GET /boards
 * - POST /boards
 * - GET /boards/{board_id}
 * - DELETE /boards/{board_id}
 */

import { apiService, buildQueryParams } from '@/services/api'
import type {
  BoardResponse,
  CreateBoardRequest
} from '@/types/boards'
import type { MessageResponse } from '@/types/api'

export class BoardsService {
  async getBoards(): Promise<BoardResponse[]> {
    return apiService.get<BoardResponse[]>('/boards')
  }

  async createBoard(boardData: CreateBoardRequest): Promise<BoardResponse> {
    return apiService.post<BoardResponse>('/boards', boardData)
  }

  async getBoard(boardId: string): Promise<BoardResponse> {
    return apiService.get<BoardResponse>(`/boards/${boardId}`)
  }

  async deleteBoard(boardId: string, hard = false): Promise<MessageResponse> {
    const queryParams = buildQueryParams({ hard })
    return apiService.delete<MessageResponse>(`/boards/${boardId}${queryParams}`)
  }
}

export const boardsService = new BoardsService()