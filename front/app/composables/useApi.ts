/**
 * API composable for Task Manager
 * Provides centralized API communication layer
 */

import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '../../types'

interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface TaskCounters {
  pending: number
  inProgress: number
  completed: number
  cancelled: number
  total: number
}

interface QueryTasksParams {
  page?: number
  limit?: number
  status?: TaskStatus
  dueDate?: string
}

export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase || 'http://localhost:3001/api'

  /**
   * Generic API request wrapper with error handling
   */
  const apiRequest = async <T>(
    endpoint: string,
    options?: {
      method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
      body?: string
      headers?: Record<string, string>
    }
  ): Promise<T> => {
    try {
      const response = await $fetch<T>(`${baseURL}${endpoint}`, {
        method: options?.method || 'GET',
        body: options?.body,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })
      return response
    } catch (error: any) {
      console.error(`API Error [${endpoint}]:`, error)
      throw new Error(error?.data?.message || error?.message || 'API request failed')
    }
  }

  return {
    tasks: {
      /**
       * Get paginated list of tasks with optional filters
       */
      getAll: async (params?: QueryTasksParams): Promise<PaginatedResponse<Task>> => {
        const queryParams = new URLSearchParams()

        if (params?.page) queryParams.append('page', params.page.toString())
        if (params?.limit) queryParams.append('limit', params.limit.toString())
        if (params?.status) queryParams.append('status', params.status)
        if (params?.dueDate) queryParams.append('dueDate', params.dueDate)

        const query = queryParams.toString()
        return apiRequest<PaginatedResponse<Task>>(
          `/tasks${query ? `?${query}` : ''}`
        )
      },

      /**
       * Get task counters by status
       */
      getCounters: async (): Promise<TaskCounters> => {
        return apiRequest<TaskCounters>('/tasks/counters')
      },

      /**
       * Get single task by ID
       */
      getById: async (id: string): Promise<Task> => {
        return apiRequest<Task>(`/tasks/${id}`)
      },

      /**
       * Create new task
       */
      create: async (data: CreateTaskInput): Promise<Task> => {
        return apiRequest<Task>('/tasks', {
          method: 'POST',
          body: JSON.stringify(data),
        })
      },

      /**
       * Update existing task
       */
      update: async (id: string, data: UpdateTaskInput): Promise<Task> => {
        return apiRequest<Task>(`/tasks/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        })
      },

      /**
       * Delete task
       */
      delete: async (id: string): Promise<void> => {
        return apiRequest<void>(`/tasks/${id}`, {
          method: 'DELETE',
        })
      },
    },
  }
}
