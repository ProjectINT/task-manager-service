import type { TaskStatus } from '../../types'

export type Option<T> = { label: string; value: T }

export const statusOptionsBase: Option<TaskStatus>[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'In progress', value: 'in-progress' },
  { label: 'Completed', value: 'completed' }
]

export const statusOptionsWithAll: Option<TaskStatus | null>[] = [
  { label: 'All', value: null },
  ...statusOptionsBase
]

export function getStatusOptions(includeAll = false) {
  return includeAll ? statusOptionsWithAll : statusOptionsBase
}
