import { defineStore } from 'pinia'
import type { Task, TaskFilter, TaskStatus, UpdateTaskInput } from '../../types'

interface TasksState {
  tasks: Task[]
  filter: TaskFilter
  loading: boolean
  error: string | null
  // UI state: task form modal
  isTaskFormOpen: boolean
  editingTaskId: Task['id'] | null
}

export const useTasksStore = defineStore('tasks', {
  state: (): TasksState => ({
    tasks: [],
    filter: {
      type: null,
      dueDate: null
    },
    loading: false,
    error: null,
    isTaskFormOpen: false,
    editingTaskId: null
  }),

  getters: {
    /**
     * Get filtered tasks based on current filter and due date
     */
    filteredTasks: (state: TasksState): Task[] => {
      let filtered = state.tasks

      // Filter by status (null means all tasks)
      if (state.filter.type !== null) {
        filtered = filtered.filter((task: Task) => task.status === state.filter.type)
      }

      // Filter by due date
      if (state.filter.dueDate) {
        const filterDate = new Date(state.filter.dueDate)
        const filterDateOnly = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate())

        filtered = filtered.filter((task: Task) => {
          if (!task.dueDate) return false

          const taskDueDate = new Date(task.dueDate)
          const taskDueDateOnly = new Date(taskDueDate.getFullYear(), taskDueDate.getMonth(), taskDueDate.getDate())

          return taskDueDateOnly.getTime() === filterDateOnly.getTime()
        })
      }

      return filtered
    },

    /**
     * Get task by ID
     */
    getTaskById: (state: TasksState) => {
      return (id: string | number): Task | undefined => {
        return state.tasks.find((task: Task) => task.id === id)
      }
    },

    /**
     * Get tasks count by status
     */
    tasksCountByStatus: (state: TasksState) => {
      return {
        all: state.tasks.length,
        pending: state.tasks.filter((t: Task) => t.status === 'pending').length,
        'in-progress': state.tasks.filter((t: Task) => t.status === 'in-progress').length,
        completed: state.tasks.filter((t: Task) => t.status === 'completed').length
      }
    },

    /**
     * Check if there are any tasks
     */
    hasTasks: (state: TasksState): boolean => state.tasks.length > 0,

    /**
     * Get total tasks count
     */
    totalTasks: (state: TasksState): number => state.tasks.length
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
    openTaskEditForm(id: string | number) {
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
     * Set filter (can update type, dueDate, or both)
     */
    setFilter(filter: Partial<TaskFilter>) {
      this.filter = { ...this.filter, ...filter }
    },

    /**
     * Add new task
     */
    addTask(task: Task) {
      const newTask: Task = {
        ...task,
        id: task.id || Date.now()
      }
      this.tasks.push(newTask)
    },

    /**
     * Update existing task
     */
    updateTask(id: string | number, updates: UpdateTaskInput) {
      const index = this.tasks.findIndex((task: Task) => task.id === id)
      if (index !== -1) {
        const task = this.tasks[index]
        if (task) {
          Object.assign(task, updates)
        }
      }
    },

    /**
     * Remove task by ID
     */
    removeTask(id: string | number) {
      const index = this.tasks.findIndex((task: Task) => task.id === id)
      if (index !== -1) {
        this.tasks.splice(index, 1)
      }
    },

    /**
     * Clear all tasks
     */
    clearTasks() {
      this.tasks = []
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
     * Fetch tasks from API (placeholder)
     */
    async fetchTasks() {
      this.setLoading(true)
      this.setError(null)
      try {
        // TODO: Replace with actual API call
        // const response = await $fetch('/api/tasks')
        // this.tasks = response

        // Mock data for now
        await new Promise(resolve => setTimeout(resolve, 500))
        console.log('Tasks fetched')
      } catch (error) {
        this.setError(error instanceof Error ? error.message : 'Failed to fetch tasks')
        console.error('Error fetching tasks:', error)
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Create task via API (placeholder)
     */
    async createTask(task: Omit<Task, 'id'>) {
      this.setLoading(true)
      this.setError(null)
      try {
        // TODO: Replace with actual API call
        // const newTask = await $fetch('/api/tasks', {
        //   method: 'POST',
        //   body: task
        // })
        // this.addTask(newTask)

        // Mock for now
        const newTask: Task = {
          ...task,
          id: Date.now()
        }
        this.addTask(newTask)
      } catch (error) {
        this.setError(error instanceof Error ? error.message : 'Failed to create task')
        console.error('Error creating task:', error)
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Delete task via API (placeholder)
     */
    async deleteTask(id: string | number) {
      this.setLoading(true)
      this.setError(null)
      try {
        // TODO: Replace with actual API call
        // await $fetch(`/api/tasks/${id}`, {
        //   method: 'DELETE'
        // })
        this.removeTask(id)
      } catch (error) {
        this.setError(error instanceof Error ? error.message : 'Failed to delete task')
        console.error('Error deleting task:', error)
        throw error
      } finally {
        this.setLoading(false)
      }
    }
  }
})
