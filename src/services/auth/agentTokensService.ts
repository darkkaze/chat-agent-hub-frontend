/**
 * Agent Tokens Service
 *
 * Servicio para gestión de tokens de agentes
 * - Listar tokens activos de un agente
 * - Crear nuevos tokens para un agente
 * - Revocar tokens específicos
 *
 * Endpoints mapeados:
 * - GET /auth/agents/{agent_id}/tokens
 * - POST /auth/agents/{agent_id}/tokens
 * - DELETE /auth/agents/{agent_id}/tokens/{token_id}
 */

import { apiService } from '@/services/api'
import type {
  AgentTokensListResponse,
  CreateAgentTokenResponse
} from '@/types/auth'
import type { ApiMessageResponse } from '@/types/api'

export class AgentTokensService {
  async getAgentTokens(agentId: string): Promise<AgentTokensListResponse> {
    return apiService.get<AgentTokensListResponse>(`/auth/agents/${agentId}/tokens`)
  }

  async createAgentToken(agentId: string): Promise<CreateAgentTokenResponse> {
    return apiService.post<CreateAgentTokenResponse>(`/auth/agents/${agentId}/tokens`, {})
  }

  async revokeAgentToken(agentId: string, tokenId: string): Promise<ApiMessageResponse> {
    return apiService.delete<ApiMessageResponse>(`/auth/agents/${agentId}/tokens/${tokenId}`)
  }
}

export const agentTokensService = new AgentTokensService()