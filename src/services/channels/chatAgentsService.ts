/**
 * Chat Agents Service
 *
 * Servicio para gestión de agentes asignados a chats específicos
 * - Listar agentes de un chat con filtros
 * - Obtener agente específico de un chat
 * - Actualizar estado activo de agente en chat
 *
 * Endpoints mapeados:
 * - GET /channels/{channel_id}/chats/{chat_id}/agents
 * - GET /channels/{channel_id}/chats/{chat_id}/agents/{agent_id}
 * - PUT /channels/{channel_id}/chats/{chat_id}/agents/{agent_id}
 */

import { apiService, buildQueryParams } from '@/services/api'
import type {
  ChatAgentsListResponse,
  ChatAgentResponse,
  ChatAgentFiltersParams,
  UpdateChatAgentRequest
} from '@/types/chatAgents'

export class ChatAgentsService {
  async getChatAgents(
    channelId: string,
    chatId: string,
    filters?: ChatAgentFiltersParams
  ): Promise<ChatAgentsListResponse> {
    const queryParams = filters ? buildQueryParams(filters) : ''
    return apiService.get<ChatAgentsListResponse>(
      `/channels/${channelId}/chats/${chatId}/agents/${queryParams}`
    )
  }

  async getChatAgent(
    channelId: string,
    chatId: string,
    agentId: string
  ): Promise<ChatAgentResponse> {
    return apiService.get<ChatAgentResponse>(
      `/channels/${channelId}/chats/${chatId}/agents/${agentId}/`
    )
  }

  async updateChatAgentStatus(
    channelId: string,
    chatId: string,
    agentId: string,
    updateData: UpdateChatAgentRequest
  ): Promise<ChatAgentResponse> {
    return apiService.put<ChatAgentResponse>(
      `/channels/${channelId}/chats/${chatId}/agents/${agentId}/`,
      updateData
    )
  }
}

export const chatAgentsService = new ChatAgentsService()