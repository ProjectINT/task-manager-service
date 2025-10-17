import type { Task } from '../../types'

/**
 * Mock tasks for development and testing
 */
export const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Implement user authentication',
    description: 'Add JWT-based authentication system with login and registration',
    status: 'in-progress',
    dueDate: new Date('2025-10-20')
  },
  {
    id: 2,
    title: 'Design database schema',
    description: 'Create ERD and design tables for the task management system',
    status: 'completed',
    dueDate: new Date('2025-10-15')
  },
  {
    id: 3,
    title: 'Setup CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment',
    status: 'pending',
    dueDate: new Date('2025-10-25')
  },
  {
    id: 4,
    title: 'Write API documentation',
    description: 'Document all REST API endpoints using Swagger/OpenAPI',
    status: 'pending',
    dueDate: new Date('2025-10-22')
  },
  {
    id: 5,
    title: 'Fix responsive layout issues',
    description: 'Resolve mobile and tablet view problems in the task list',
    status: 'in-progress',
    dueDate: new Date('2025-10-18')
  },
  {
    id: 6,
    title: 'Add task filtering',
    description: 'Implement filters by status, date, and priority',
    status: 'completed',
    dueDate: new Date('2025-10-17')
  },
  {
    id: 7,
    title: 'Optimize database queries',
    description: 'Add indexes and improve query performance',
    status: 'pending',
    dueDate: new Date('2025-10-30')
  },
  {
    id: 8,
    title: 'Implement dark mode',
    description: 'Add theme switcher and dark mode styles',
    status: 'in-progress',
    dueDate: new Date('2025-10-19')
  },
  {
    id: 9,
    title: 'Write unit tests',
    description: 'Add comprehensive test coverage for core functionality',
    status: 'pending',
    dueDate: new Date('2025-10-28')
  },
  {
    id: 10,
    title: 'Setup error monitoring',
    description: 'Integrate Sentry for error tracking and monitoring',
    status: 'completed',
    dueDate: new Date('2025-10-16')
  }
]
