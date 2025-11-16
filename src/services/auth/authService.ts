/**
 * Auth Service
 * 
 * Servicio para autenticación y gestión de usuarios/agentes
 * - Login/logout de usuarios
 * - CRUD de usuarios (admin only)
 * - CRUD de agentes (admin only)
 * 
 * Endpoints mapeados:
 * - POST /auth/token
 * - GET /auth/users
 * - POST /auth/users
 * - GET /auth/users/{user_id}
 * - PUT /auth/users/{user_id}
 * - DELETE /auth/users/{user_id}
 * - GET /auth/agents
 * - POST /auth/agents
 * - PUT /auth/agents/{agent_id}
 * - DELETE /auth/agents/{agent_id}
 */

import { apiService, buildQueryParams } from '@/services/api'
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
  CreateAgentRequest,
  UpdateAgentRequest,
  AgentResponse,
  HasUsersResponse
} from '@/types/auth'
import type { ApiMessageResponse } from '@/types/api'

export class AuthService {
  // System check
  async hasUsers(): Promise<HasUsersResponse> {
    return apiService.get<HasUsersResponse>('/auth/has-users')
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/token', credentials)

    // Guardar token automáticamente
    apiService.setToken(response.access_token)

    return response
  }

  async signup(userData: SignupRequest): Promise<SignupResponse> {
    const response = await apiService.post<SignupResponse>('/auth/signup', userData)

    // Guardar token automáticamente
    apiService.setToken(response.access_token)

    return response
  }

  async logout(): Promise<void> {
    apiService.clearToken()
  }

  // Users Management
  async getUsers(params?: { is_active?: boolean }): Promise<UserResponse[]> {
    const queryParams = params ? buildQueryParams(params) : ''
    return apiService.get<UserResponse[]>(`/auth/users/${queryParams}`)
  }

  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    return apiService.post<UserResponse>('/auth/users', userData)
  }

  async getUser(userId: string): Promise<UserResponse> {
    return apiService.get<UserResponse>(`/auth/users/${userId}`)
  }

  async updateUser(userId: string, userData: UpdateUserRequest): Promise<UserResponse> {
    return apiService.put<UserResponse>(`/auth/users/${userId}`, userData)
  }

  async deleteUser(userId: string, hard = false): Promise<ApiMessageResponse> {
    const queryParams = buildQueryParams({ hard })
    return apiService.delete<ApiMessageResponse>(`/auth/users/${userId}/${queryParams}`)
  }

  // Agents Management
  async getAgents(params?: { is_active?: boolean }): Promise<AgentResponse[]> {
    const queryParams = params ? buildQueryParams(params) : ''
    return apiService.get<AgentResponse[]>(`/auth/agents/${queryParams}`)
  }

  async createAgent(agentData: CreateAgentRequest): Promise<AgentResponse> {
    return apiService.post<AgentResponse>('/auth/agents', agentData)
  }

  async updateAgent(agentId: string, agentData: UpdateAgentRequest): Promise<AgentResponse> {
    return apiService.put<AgentResponse>(`/auth/agents/${agentId}`, agentData)
  }

  async deleteAgent(agentId: string, hard = false): Promise<ApiMessageResponse> {
    const queryParams = buildQueryParams({ hard })
    return apiService.delete<ApiMessageResponse>(`/auth/agents/${agentId}/${queryParams}`)
  }
}

export const authService = new AuthService()