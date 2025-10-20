/**
 * Global types for Task Manager
 */

import type { ComputedRef } from 'vue'
import type { $Enums, Prisma, Task as PrismaTask } from '@prisma/client'

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
 * Task interface (matches backend response with dates as strings for JSON serialization)
 */
export type Task = Omit<PrismaTask, 'dueDate' | 'createdAt' | 'updatedAt'> & {
  dueDate: string | null
}

/**
 * Create task input interface (based on Prisma TaskCreateInput with dates as strings)
 */
export type CreateTaskInput = Omit<Prisma.TaskCreateInput, 'id' | 'dueDate' | 'createdAt' | 'updatedAt'> & {
  dueDate?: string
}

/**
 * Update task input interface (partial CreateTaskInput)
 */
export type UpdateTaskInput = Partial<CreateTaskInput>

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
  in_progress: number
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

