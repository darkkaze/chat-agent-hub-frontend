/**
 * Base API Service
 * 
 * Cliente HTTP base para todas las comunicaciones con la API
 * - Configuración de axios
 * - Manejo de autenticación (headers)
 * - Interceptors para request/response
 * - Error handling centralizado
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { ApiError } from '@/types/api'

class ApiService {
  private client: AxiosInstance
  private token: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor para agregar token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.authorization = `Bearer ${this.token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor para manejo de errores
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        const apiError: ApiError = {
          detail: error.response?.data?.detail || error.message || 'Unknown error',
          type: error.response?.data?.type
        }

        // Si es 401, limpiar token
        if (error.response?.status === 401) {
          this.clearToken()
        }

        return Promise.reject(apiError)
      }
    )
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem('auth_token', token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('auth_token')
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token')
    }
    return this.token
  }

  // HTTP Methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }
}

// Instancia singleton
export const apiService = new ApiService()

// Helper para construir query params
export const buildQueryParams = (params: Record<string, any>): string => {
  const filtered = Object.entries(params).filter(([_, value]) => 
    value !== undefined && value !== null && value !== ''
  )
  
  if (filtered.length === 0) return ''
  
  const searchParams = new URLSearchParams()
  filtered.forEach(([key, value]) => {
    searchParams.append(key, String(value))
  })
  
  return `?${searchParams.toString()}`
}