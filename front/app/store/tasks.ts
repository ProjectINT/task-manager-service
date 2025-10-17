import { defineStore } from 'pinia'
import type {
  Task,
  TaskFilter,
  TaskStatus,
  UpdateTaskInput,
  CreateTaskInput,
  TaskCounters,
  PaginatedResponse
} from '../../types'

interface TasksState {
  // Data
  tasks: Task[]
  counters: TaskCounters | null
  currentPage: number
  totalPages: number
  totalTasks: number
  pageSize: number

  // Filters
  filter: TaskFilter

  // UI state
  loading: boolean
  error: string | null
  isTaskFormOpen: boolean
  editingTaskId: Task['id'] | null
}

export const useTasksStore = defineStore('tasks', {
  state: (): TasksState => ({
    // Data
    tasks: [],
    counters: null,
    currentPage: 1,
    totalPages: 1,
    totalTasks: 0,
    pageSize: 10,

    // Filters
    filter: {
      type: null,
      dueDate: null
    },

    // UI state
    loading: false,
    error: null,
    isTaskFormOpen: false,
    editingTaskId: null
  }),

  getters: {
    /**
     * Get filtered tasks (client-side filtering on already loaded data)
     */
    filteredTasks: (state: TasksState): Task[] => {
      let filtered = state.tasks

      // Filter by status (null means all tasks)
      if (state.filter.type !== null) {
        filtered = filtered.filter((task: Task) => task.status === state.filter.type)
      }

      // Filter by due date (tasks due on or before the selected date)
      if (state.filter.dueDate) {
        const filterDate = new Date(state.filter.dueDate)
        const filterDateOnly = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate())

        filtered = filtered.filter((task: Task) => {
          if (!task.dueDate) return false

          const taskDueDate = new Date(task.dueDate)
          const taskDueDateOnly = new Date(taskDueDate.getFullYear(), taskDueDate.getMonth(), taskDueDate.getDate())

          return taskDueDateOnly.getTime() <= filterDateOnly.getTime()
        })
      }

      return filtered
    },

    /**
     * Get task by ID
     */
    getTaskById: (state: TasksState) => {
      return (id: string): Task | undefined => {
        return state.tasks.find((task: Task) => task.id === id)
      }
    },

    /**
     * Get tasks count by status from counters or local calculation
     */
    tasksCountByStatus: (state: TasksState) => {
      if (state.counters) {
        return {
          all: state.counters.total,
          pending: state.counters.pending,
          in_progress: state.counters.in_progress,
          completed: state.counters.completed,
          cancelled: state.counters.cancelled
        }
      }

      // Fallback to local calculation
      return {
        all: state.tasks.length,
        pending: state.tasks.filter((t: Task) => t.status === 'pending').length,
        in_progress: state.tasks.filter((t: Task) => t.status === 'in_progress').length,
        completed: state.tasks.filter((t: Task) => t.status === 'completed').length,
        cancelled: state.tasks.filter((t: Task) => t.status === 'cancelled').length
      }
    },

    /**
     * Check if there are any tasks
     */
    hasTasks: (state: TasksState): boolean => state.totalTasks > 0,

    /**
     * Has more pages to load
     */
    hasMorePages: (state: TasksState): boolean => state.currentPage < state.totalPages,

    /**
     * Is currently loading
     */
    isLoading: (state: TasksState): boolean => state.loading,

    /**
     * Current error message
     */
    errorMessage: (state: TasksState): string | null => state.error
  },

  actions: {
    /**
     * Open task form in create mode
     */
    openTaskCreateForm() {
      this.isTaskFormOpen = true
      this.editingTaskId = null
    },

    /**
     * Open task form in edit mode for a given task id
     */
    openTaskEditForm(id: string) {
      this.isTaskFormOpen = true
      this.editingTaskId = id
    },

    /**
     * Close task form modal and clear editing id
     */
    closeTaskForm() {
      this.isTaskFormOpen = false
      this.editingTaskId = null
    },

    /**
     * Set filter and refetch tasks
     */
    async setFilter(filter: Partial<TaskFilter>) {
      this.filter = { ...this.filter, ...filter }
      // Reset to first page when filter changes
      this.currentPage = 1
      await this.fetchTasks()
    },

    /**
     * Clear all filters
     */
    async clearFilters() {
      this.filter = {
        type: null,
        dueDate: null
      }
      this.currentPage = 1
      await this.fetchTasks()
    },

    /**
     * Set loading state
     */
    setLoading(loading: boolean) {
      this.loading = loading
    },

    /**
     * Set error
     */
    setError(error: string | null) {
      this.error = error
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null
    },

    /**
     * Fetch tasks from API with current filters and pagination
     */
    async fetchTasks(page?: number) {
      this.setLoading(true)
      this.clearError()

      try {
        const api = useApi()

        const params: any = {
          page: page || this.currentPage,
          limit: this.pageSize
        }

        // Add filters if set
        if (this.filter.type) {
          params.status = this.filter.type
        }

        if (this.filter.dueDate) {
          params.dueDate = new Date(this.filter.dueDate).toISOString()
        }

        const response: PaginatedResponse<Task> = await api.tasks.getAll(params)

        // Update state with response
        this.tasks = response.data
        this.currentPage = response.meta.page
        this.totalPages = response.meta.totalPages
        this.totalTasks = response.meta.total
        this.pageSize = response.meta.limit

        console.log(`✅ Loaded ${response.data.length} tasks (page ${response.meta.page}/${response.meta.totalPages})`)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch tasks'
        this.setError(message)
        console.error('Error fetching tasks:', error)
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Fetch task counters from API
     */
    async fetchCounters() {
      try {
        const api = useApi()
        this.counters = await api.tasks.getCounters()
        console.log('✅ Counters loaded:', this.counters)
      } catch (error) {
        console.error('Error fetching counters:', error)
        // Don't set error for counters, it's not critical
      }
    },

    /**
     * Load next page of tasks
     */
    async loadNextPage() {
      if (!this.hasMorePages) return
      await this.fetchTasks(this.currentPage + 1)
    },

    /**
     * Load previous page of tasks
     */
    async loadPreviousPage() {
      if (this.currentPage <= 1) return
      await this.fetchTasks(this.currentPage - 1)
    },

    /**
     * Go to specific page
     */
    async goToPage(page: number) {
      if (page < 1 || page > this.totalPages) return
      await this.fetchTasks(page)
    },

    /**
     * Fetch single task by ID
     */
    async fetchTaskById(id: string): Promise<Task | null> {
      this.setLoading(true)
      this.clearError()

      try {
        const api = useApi()
        const task = await api.tasks.getById(id)

        // Update task in local state if it exists
        const index = this.tasks.findIndex(t => t.id === id)
        if (index !== -1) {
          this.tasks[index] = task
        }

        return task
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch task'
        this.setError(message)
        console.error('Error fetching task:', error)
        return null
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Create new task via API
     */
    async createTask(taskData: CreateTaskInput): Promise<Task | null> {
      this.setLoading(true)
      this.clearError()

      try {
        const api = useApi()
        const newTask = await api.tasks.create(taskData)

        console.log('✅ Task created:', newTask)

        // Refresh tasks list and counters
        await Promise.all([
          this.fetchTasks(1), // Go to first page to see new task
          this.fetchCounters()
        ])

        return newTask
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create task'
        this.setError(message)
        console.error('Error creating task:', error)
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Update existing task via API
     */
    async updateTask(id: string, updates: UpdateTaskInput): Promise<Task | null> {
      this.setLoading(true)
      this.clearError()

      try {
        const api = useApi()
        const updatedTask = await api.tasks.update(id, updates)

        console.log('✅ Task updated:', updatedTask)

        // Update task in local state
        const index = this.tasks.findIndex(t => t.id === id)
        if (index !== -1) {
          this.tasks[index] = updatedTask
        }

        // Refresh counters if status changed
        if (updates.status) {
          await this.fetchCounters()
        }

        return updatedTask
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update task'
        this.setError(message)
        console.error('Error updating task:', error)
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Delete task via API
     */
    async deleteTask(id: string): Promise<boolean> {
      this.setLoading(true)
      this.clearError()

      try {
        const api = useApi()
        await api.tasks.delete(id)

        console.log('✅ Task deleted:', id)

        // Remove from local state
        const index = this.tasks.findIndex(t => t.id === id)
        if (index !== -1) {
          this.tasks.splice(index, 1)
        }

        // Refresh tasks and counters
        await Promise.all([
          this.fetchTasks(this.currentPage),
          this.fetchCounters()
        ])

        return true
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete task'
        this.setError(message)
        console.error('Error deleting task:', error)
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Initialize store - fetch initial data
     */
    async initialize() {
      await Promise.all([
        this.fetchTasks(),
        this.fetchCounters()
      ])
    },

    /**
     * Refresh all data
     */
    async refresh() {
      await this.initialize()
    }
  }
})
