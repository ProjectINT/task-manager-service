/**
 * Global types for Task Manager
 */

import type { ComputedRef } from 'vue'

/**
 * Task status
 */
export type TaskStatus = 'pending' | 'in-progress' | 'completed'

/**
 * Task filter interface
 */
export interface TaskFilter {
  type: TaskStatus | null
  dueDate: Date | null
}

/**
 * Task interface
 */
export interface Task {
  id: string | number
  title: string
  description?: string
  status: TaskStatus
  dueDate?: string | Date
}

/**
 * Create task input interface
 */
export interface CreateTaskInput {
  title: string
  description?: string
  status?: TaskStatus
  dueDate?: string | Date
}

/**
 * Update task input interface
 */
export interface UpdateTaskInput {
  title?: string
  description?: string
  status?: TaskStatus
  dueDate?: string | Date
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
  updateTask: (id: string | number, updated: UpdateTaskInput) => void
  removeTask: (id: string | number) => void
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
