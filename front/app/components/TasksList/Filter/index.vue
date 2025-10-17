<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTasksStore } from '../../../store/tasks'
import type { TaskStatus } from '../../../../types'

const tasksStore = useTasksStore()
const { counters, loading, filter } = storeToRefs(tasksStore)

function handleStatusChange(value: TaskStatus | null) {
  tasksStore.setFilter({ type: value })
}

function handleDueDateChange(value: Date | null) {
  tasksStore.setFilter({ dueDate: value })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status:</span>
      <div class="flex flex-wrap gap-2 items-center">
        <TasksListFilterStatusFilterButtons
          :model-value="filter.type"
          :disabled="loading"
          :counts="counters ? { all: counters.total, pending: counters.pending, in_progress: counters.in_progress, completed: counters.completed, cancelled: counters.cancelled } : undefined"
          :include-all="true"
          @update:model-value="handleStatusChange"
        />
        <DateSelect
          :model-value="filter.dueDate"
          @update:model-value="handleDueDateChange"
        />
      </div>
    </div>

  </div>
  </template>
