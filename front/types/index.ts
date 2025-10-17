/**
 * Global types for Task Manager
 */

import type { ComputedRef } from 'vue'
import type { $Enums } from '@prisma/client'

/**
 * Task status
 */
export type TaskStatus = $Enums.TaskStatus

/**
 * Task filter interface
 */
export interface TaskFilter {
  type: TaskStatus | null
  dueDate: Date | null
}

/**
 * Task interface (matches backend response)
 */
export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Create task input interface
 */
export interface CreateTaskInput {
  title: string
  description?: string
  status?: TaskStatus
  dueDate?: string
}

/**
 * Update task input interface
 */
export interface UpdateTaskInput {
  title?: string
  description?: string
  status?: TaskStatus
  dueDate?: string
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

/**
 * Task counters interface
 */
export interface TaskCounters {
  pending: number
  inProgress: number
  completed: number
  cancelled: number
  total: number
}

/**
 * Tasks state interface
 */
export interface TasksState {
  tasks: Task[]
  filter: TaskFilter
}

/**
 * useTasks composable return interface
 */
export interface UseTasksReturn {
  state: TasksState
  filteredTasks: ComputedRef<Task[]>
  addTask: (task: Task) => void
  updateTask: (id: string, updated: UpdateTaskInput) => void
  removeTask: (id: string) => void
}

/**
 * Task sorting options
 */
export type TaskSortBy = 'dueDate' | 'title' | 'status'
export type SortOrder = 'asc' | 'desc'

/**
 * Task sort options interface
 */
export interface TaskSortOptions {
  sortBy: TaskSortBy
  order: SortOrder
}

