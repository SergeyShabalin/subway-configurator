// lib/api/base-client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

export enum EApiClientName {
  'station-constructor' = 'station-constructor',
}

interface ApiClientConfig {
  baseURL?: string
  timeout?: number
  platform?: 'NODE' | 'BROWSER'
}

interface ApiErrorResponse {
  error?: string
}

export class BaseApiClient {
  protected client: AxiosInstance
  protected name: EApiClientName

  constructor(name: EApiClientName, config: ApiClientConfig = {}) {
    this.name = name
    this.client = axios.create({
      baseURL: config.baseURL || '/api',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.client.interceptors.request.use(
      (config) => {
        console.log(`[${this.name}] Request:`, config.method?.toUpperCase(), config.url)
        return config
      },
      (error) => {
        console.error(`[${this.name}] Request Error:`, error)
        return Promise.reject(error)
      }
    )

    this.client.interceptors.response.use(
      (response) => {
        console.log(`[${this.name}] Response:`, response.status, response.config.url)
        return response
      },
      (error: unknown) => {
        if (axios.isAxiosError(error)) {
          console.error(
            `[${this.name}] Response Error:`,
            error.response?.status,
            error.response?.data
          )
        } else {
          console.error(`[${this.name}] Response Error:`, error)
        }
        return Promise.reject(error)
      }
    )
  }

  protected async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.request<T>(config)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as ApiErrorResponse
        throw new Error(data?.error || error.message)
      }
      throw error
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url })
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data })
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data })
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url })
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data })
  }
}
