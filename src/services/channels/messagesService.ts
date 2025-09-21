/**
 * Messages Service
 * 
 * Servicio para gestión de mensajes dentro de chats
 * - Obtener mensajes de un chat con paginación
 * - Enviar mensajes a un chat
 * 
 * Endpoints mapeados:
 * - GET /channels/{channel_id}/chats/{chat_id}/messages
 * - POST /channels/{channel_id}/chats/{chat_id}/messages
 */

import { apiService, buildQueryParams } from '@/services/api'
import type {
  ChatMessagesResponse,
  MessagesFiltersParams,
  SendMessageRequest,
  MessageResponse
} from '@/types/channels'

export class MessagesService {
  async getChatMessages(
    channelId: string,
    chatId: string,
    filters?: MessagesFiltersParams
  ): Promise<ChatMessagesResponse> {
    const queryParams = filters ? buildQueryParams(filters) : ''
    return apiService.get<ChatMessagesResponse>(
      `/channels/${channelId}/chats/${chatId}/messages${queryParams}`
    )
  }

  async sendMessage(
    channelId: string,
    chatId: string,
    messageData: SendMessageRequest
  ): Promise<MessageResponse> {
    return apiService.post<MessageResponse>(
      `/channels/${channelId}/chats/${chatId}/messages`,
      messageData
    )
  }
}

export const messagesService = new MessagesService()