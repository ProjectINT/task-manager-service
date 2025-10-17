import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import { useTasksStore } from './tasks'
import type { Task, TaskStatus } from '../../types'

describe('TasksStore - filteredTasks getter', () => {
  beforeEach(() => {
    // Create a new pinia instance for each test
    setActivePinia(createPinia())
  })

  const createMockTask = (overrides: Partial<Task>): Task => ({
    id: Math.random().toString(36),
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending' as TaskStatus,
    dueDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  })

  describe('Status filtering', () => {
    it('should return all tasks when filter.type is null', () => {
      const store = useTasksStore()

      store.tasks = [
        createMockTask({ id: '1', status: 'pending' as TaskStatus }),
        createMockTask({ id: '2', status: 'in_progress' as TaskStatus }),
        createMockTask({ id: '3', status: 'completed' as TaskStatus })
      ]

      store.filter.type = null

      expect(store.filteredTasks).toHaveLength(3)
    })

    it('should filter tasks by status "pending"', () => {
      const store = useTasksStore()

      store.tasks = [
        createMockTask({ id: '1', status: 'pending' as TaskStatus }),
        createMockTask({ id: '2', status: 'in_progress' as TaskStatus }),
        createMockTask({ id: '3', status: 'pending' as TaskStatus })
      ]

      store.filter.type = 'pending' as TaskStatus

      const filtered = store.filteredTasks
      expect(filtered).toHaveLength(2)
      expect(filtered.every(task => task.status === 'pending')).toBe(true)
    })

    it('should filter tasks by status "in_progress"', () => {
      const store = useTasksStore()

      store.tasks = [
        createMockTask({ id: '1', status: 'pending' as TaskStatus }),
        createMockTask({ id: '2', status: 'in_progress' as TaskStatus }),
        createMockTask({ id: '3', status: 'completed' as TaskStatus })
      ]

      store.filter.type = 'in_progress' as TaskStatus

      const filtered = store.filteredTasks
      expect(filtered).toHaveLength(1)
      expect(filtered[0]?.status).toBe('in_progress')
    })

    it('should filter tasks by status "completed"', () => {
      const store = useTasksStore()

      store.tasks = [
        createMockTask({ id: '1', status: 'pending' as TaskStatus }),
        createMockTask({ id: '2', status: 'completed' as TaskStatus }),
        createMockTask({ id: '3', status: 'completed' as TaskStatus })
      ]

      store.filter.type = 'completed' as TaskStatus

      const filtered = store.filteredTasks
      expect(filtered).toHaveLength(2)
      expect(filtered.every(task => task.status === 'completed')).toBe(true)
    })
  })

  describe('Due date filtering', () => {
    it('should filter tasks due on or before selected date', () => {
      const store = useTasksStore()

      const today = new Date('2025-10-18T12:00:00.000Z')
      const yesterday = new Date('2025-10-17T12:00:00.000Z')
      const tomorrow = new Date('2025-10-19T12:00:00.000Z')

      store.tasks = [
        createMockTask({ id: '1', dueDate: yesterday.toISOString() }),
        createMockTask({ id: '2', dueDate: today.toISOString() }),
        createMockTask({ id: '3', dueDate: tomorrow.toISOString() })
      ]

      store.filter.dueDate = today as any

      const filtered = store.filteredTasks
      expect(filtered).toHaveLength(2)
      expect(filtered.map(t => t.id)).toEqual(['1', '2'])
    })

    it('should exclude tasks without due date when date filter is set', () => {
      const store = useTasksStore()

      const today = new Date('2025-10-18T12:00:00.000Z')

      store.tasks = [
        createMockTask({ id: '1', dueDate: today.toISOString() }),
        createMockTask({ id: '2', dueDate: null }),
        createMockTask({ id: '3', dueDate: today.toISOString() })
      ]

      store.filter.dueDate = today as any

      const filtered = store.filteredTasks
      expect(filtered).toHaveLength(2)
      expect(filtered.map(t => t.id)).toEqual(['1', '3'])
    })

    it('should ignore time component when filtering by date', () => {
      const store = useTasksStore()

      // Same date but different times
      const morning = new Date('2025-10-18T08:00:00.000Z')
      const afternoon = new Date('2025-10-18T14:00:00.000Z')
      const evening = new Date('2025-10-18T20:00:00.000Z')

      store.tasks = [
        createMockTask({ id: '1', dueDate: morning.toISOString() }),
        createMockTask({ id: '2', dueDate: afternoon.toISOString() }),
        createMockTask({ id: '3', dueDate: evening.toISOString() })
      ]

      // Filter by afternoon time
      store.filter.dueDate = afternoon as any

      const filtered = store.filteredTasks
      // All three tasks should be included because they all have the same date
      expect(filtered).toHaveLength(3)
    })

    it('should handle tasks with different time zones correctly', () => {
      const store = useTasksStore()

      // Same calendar date but different times
      const dateStr = '2025-10-18'
      const task1Time = `${dateStr}T00:00:00.000Z` // Midnight UTC
      const task2Time = `${dateStr}T12:00:00.000Z` // Noon UTC
      const task3Time = `${dateStr}T23:59:59.999Z` // End of day UTC

      store.tasks = [
        createMockTask({ id: '1', dueDate: task1Time }),
        createMockTask({ id: '2', dueDate: task2Time }),
        createMockTask({ id: '3', dueDate: task3Time })
      ]

      store.filter.dueDate = new Date(`${dateStr}T15:00:00.000Z`) as any

      const filtered = store.filteredTasks
      expect(filtered).toHaveLength(3)
      expect(filtered.map(t => t.id)).toEqual(['1', '2', '3'])
    })

    it('should return empty array when no tasks match date filter', () => {
      const store = useTasksStore()

      const futureDate = new Date('2025-10-25T12:00:00.000Z')
      const filterDate = new Date('2025-10-15T12:00:00.000Z')

      store.tasks = [
        createMockTask({ id: '1', dueDate: futureDate.toISOString() }),
        createMockTask({ id: '2', dueDate: futureDate.toISOString() })
      ]

      store.filter.dueDate = filterDate as any

      expect(store.filteredTasks).toHaveLength(0)
    })
  })

  describe('Combined filtering', () => {
    it('should apply both status and date filters', () => {
      const store = useTasksStore()

      const yesterday = new Date('2025-10-17T12:00:00.000Z')
      const today = new Date('2025-10-18T12:00:00.000Z')
      const tomorrow = new Date('2025-10-19T12:00:00.000Z')

      store.tasks = [
        createMockTask({ id: '1', status: 'pending' as TaskStatus, dueDate: yesterday.toISOString() }),
        createMockTask({ id: '2', status: 'pending' as TaskStatus, dueDate: today.toISOString() }),
        createMockTask({ id: '3', status: 'pending' as TaskStatus, dueDate: tomorrow.toISOString() }),
        createMockTask({ id: '4', status: 'completed' as TaskStatus, dueDate: yesterday.toISOString() }),
        createMockTask({ id: '5', status: 'completed' as TaskStatus, dueDate: today.toISOString() })
      ]

      store.filter.type = 'pending' as TaskStatus
      store.filter.dueDate = today as any

      const filtered = store.filteredTasks
      expect(filtered).toHaveLength(2)
      expect(filtered.map(t => t.id)).toEqual(['1', '2'])
      expect(filtered.every(task => task.status === 'pending')).toBe(true)
    })

    it('should return all tasks when both filters are null', () => {
      const store = useTasksStore()

      store.tasks = [
        createMockTask({ id: '1', status: 'pending' as TaskStatus }),
        createMockTask({ id: '2', status: 'in_progress' as TaskStatus }),
        createMockTask({ id: '3', status: 'completed' as TaskStatus })
      ]

      store.filter.type = null
      store.filter.dueDate = null

      expect(store.filteredTasks).toHaveLength(3)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty tasks array', () => {
      const store = useTasksStore()

      store.tasks = []
      store.filter.type = 'pending' as TaskStatus
      store.filter.dueDate = new Date() as any

      expect(store.filteredTasks).toHaveLength(0)
    })

    it('should handle invalid date strings gracefully', () => {
      const store = useTasksStore()

      store.tasks = [
        createMockTask({ id: '1', dueDate: 'invalid-date' })
      ]

      store.filter.dueDate = new Date('2025-10-18') as any

      // Should not throw an error
      expect(() => store.filteredTasks).not.toThrow()
    })

    it('should handle tasks at the exact filter date boundary', () => {
      const store = useTasksStore()

      const exactDate = new Date('2025-10-18T00:00:00.000Z')

      store.tasks = [
        createMockTask({ id: '1', dueDate: exactDate.toISOString() })
      ]

      store.filter.dueDate = exactDate as any

      const filtered = store.filteredTasks
      expect(filtered).toHaveLength(1)
      expect(filtered[0]?.id).toBe('1')
    })
  })
})
