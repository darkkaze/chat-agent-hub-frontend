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
  callback_url: string
  is_fire_and_forget: boolean
  channel_id: string
}

export interface UpdateAgentRequest {
  name?: string
  callback_url?: string
  is_fire_and_forget?: boolean
  is_active?: boolean
}

export interface AgentResponse extends BaseEntity {
  name: string
  callback_url: string
  is_fire_and_forget: boolean
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