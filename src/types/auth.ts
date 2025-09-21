/**
 * Authentication Types
 * 
 * Types para autenticación y gestión de usuarios/agentes
 * - Login/logout
 * - CRUD de usuarios
 * - CRUD de agentes
 */

import type { BaseEntity } from './api'

// Login Types
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: UserResponse
}

// Signup Types
export interface SignupRequest {
  username: string
  password: string
  email?: string
}

export interface SignupResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_at: string
  user: UserResponse
}

// User Types
export interface CreateUserRequest {
  username: string
  email: string
  password: string
  role: string
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  password?: string
  role?: string
  is_active?: boolean
}

export interface UserResponse extends BaseEntity {
  username: string
  email: string
  role: string
  is_active: boolean
}

// Agent Types
export interface CreateAgentRequest {
  name: string
  webhook_url?: string
  is_fire_and_forget: boolean
  buffer_time_seconds: number
  history_msg_count: number
  recent_msg_window_minutes: number
  activate_for_new_conversation: boolean
}

export interface UpdateAgentRequest {
  name?: string
  webhook_url?: string
  is_fire_and_forget?: boolean
  buffer_time_seconds?: number
  history_msg_count?: number
  recent_msg_window_minutes?: number
  activate_for_new_conversation?: boolean
  is_active?: boolean
}

export interface AgentResponse extends BaseEntity {
  name: string
  webhook_url?: string
  is_fire_and_forget: boolean
  buffer_time_seconds: number
  history_msg_count: number
  recent_msg_window_minutes: number
  activate_for_new_conversation: boolean
  is_active: boolean
}

// Auth State
export interface AuthState {
  user: UserResponse | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  AGENT = 'agent'
}

// Has Users Response
export interface HasUsersResponse {
  has_users: boolean
}

// Agent Tokens Types
export interface AgentTokenResponse {
  access_token: string
  expires_at: string
}

export interface AgentTokensListResponse {
  tokens: AgentTokenResponse[]
}

export interface CreateAgentTokenResponse {
  access_token: string
  expires_at: string
}