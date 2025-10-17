<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTasksStore } from '../../../store/tasks'
import type { TaskStatus } from '../../../../types'

const tasksStore = useTasksStore()
const { tasksCountByStatus, loading } = storeToRefs(tasksStore)

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
          :model-value="tasksStore.filter.type"
          :disabled="loading"
          :counts="{ all: tasksCountByStatus?.all, pending: tasksCountByStatus?.pending, in_progress: tasksCountByStatus?.in_progress, completed: tasksCountByStatus?.completed, cancelled: tasksCountByStatus?.cancelled }"
          :include-all="true"
          @update:model-value="handleStatusChange"
        />
        <DateSelect
          :model-value="tasksStore.filter.dueDate"
          @update:model-value="handleDueDateChange"
        />
      </div>
    </div>

  </div>
  </template>
