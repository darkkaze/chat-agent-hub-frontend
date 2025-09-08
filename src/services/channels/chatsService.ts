/**
 * Chats Service
 * 
 * Servicio para gestión de chats dentro de canales
 * - Lista de chats con filtros y paginación
 * - Detalles de chat individual
 * - Asignación de chats a usuarios
 * - Eliminación de chats
 * 
 * Endpoints mapeados:
 * - GET /channels/{channel_id}/chats
 * - GET /channels/{channel_id}/chats/{chat_id}
 * - POST /channels/{channel_id}/chats/{chat_id}/assign
 * - DELETE /channels/{channel_id}/chats/{chat_id}
 */

import { apiService, buildQueryParams } from '@/services/api'
import type {
  ChatListResponse,
  ChatResponse,
  ChatFiltersParams,
  AssignChatRequest
} from '@/types/channels'

export class ChatsService {
  async getChannelChats(
    channelId: string, 
    filters?: ChatFiltersParams
  ): Promise<ChatListResponse> {
    const queryParams = filters ? buildQueryParams(filters) : ''
    return apiService.get<ChatListResponse>(`/channels/${channelId}/chats${queryParams}`)
  }

  async getChat(channelId: string, chatId: string): Promise<ChatResponse> {
    return apiService.get<ChatResponse>(`/channels/${channelId}/chats/${chatId}`)
  }

  async assignChat(
    channelId: string, 
    chatId: string, 
    assignData: AssignChatRequest
  ): Promise<ChatResponse> {
    return apiService.post<ChatResponse>(
      `/channels/${channelId}/chats/${chatId}/assign`, 
      assignData
    )
  }

  async deleteChat(
    channelId: string, 
    chatId: string, 
    soft = false
  ): Promise<Record<string, any>> {
    const queryParams = buildQueryParams({ soft })
    return apiService.delete<Record<string, any>>(
      `/channels/${channelId}/chats/${chatId}${queryParams}`
    )
  }
}

export const chatsService = new ChatsService()