<script setup lang="ts">
import type { TaskStatus } from '../../../../types'

type FilterCounts = {
  all: number
  pending: number
  'in-progress': number
  completed: number
}

const props = defineProps<{
  modelValue: TaskStatus | null
  counts: FilterCounts
  loading?: boolean
  dueDate?: Date | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: TaskStatus | null): void
  (e: 'update:dueDate', value: Date | null): void
}>()
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status:</span>
      <div class="flex flex-wrap gap-2 items-center">
        <TasksListFilterStatusFilterButtons
          :model-value="modelValue"
          :disabled="loading"
          :counts="{ all: counts?.all, pending: counts?.pending, 'in-progress': counts?.['in-progress'], completed: counts?.completed }"
          :include-all="true"
          @update:model-value="emit('update:modelValue', $event)"
        />
        <DateSelect
          :model-value="dueDate"
          @update:model-value="emit('update:dueDate', $event)"
        />
      </div>
    </div>

  </div>
  </template>
