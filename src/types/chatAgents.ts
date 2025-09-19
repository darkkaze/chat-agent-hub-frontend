/**
 * Chat Agents Types
 *
 * Types para gestión de agentes asignados a chats específicos
 * - Lista de agentes de un chat con filtros
 * - Obtener agente específico de un chat
 * - Actualizar estado activo de agentes en chats
 */

import type { BaseEntity, PaginationParams } from './api'
import type { AgentResponse } from './auth'

// Chat Agent Assignment Response
export interface ChatAgentResponse extends BaseEntity {
  chat_id: string
  agent_id: string
  active: boolean
  agent: AgentResponse
}

// Chat Agents List Response
export interface ChatAgentsListResponse {
  chat_agents: ChatAgentResponse[]
  total_count: number
  has_more: boolean
}

// Filters for chat agents list
export interface ChatAgentFiltersParams extends PaginationParams {
  active?: boolean
}

// Update chat agent status request
export interface UpdateChatAgentRequest {
  active: boolean
}