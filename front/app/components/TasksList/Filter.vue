<script setup lang="ts">
import { computed } from 'vue'
import type { TaskStatus } from '../../../types'

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

const filters = computed(() => ([
  { label: 'All', value: null, count: props.counts?.all ?? 0 },
  { label: 'Pending', value: 'pending' as TaskStatus, count: props.counts?.pending ?? 0 },
  { label: 'In progress', value: 'in-progress' as TaskStatus, count: props.counts?.['in-progress'] ?? 0 },
  { label: 'Completed', value: 'completed' as TaskStatus, count: props.counts?.completed ?? 0 }
]))

function selectFilter(value: TaskStatus | null) {
  if (props.loading) {
    return
  }
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status:</span>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="option in filters"
          :key="option.value ?? 'all'"
          :disabled="loading"
          :color="modelValue === option.value ? 'primary' : 'neutral'"
          :variant="modelValue === option.value ? 'solid' : 'soft'"
          size="sm"
          @click="selectFilter(option.value)"
        >
          <span class="flex items-center gap-2">
            <span>{{ option.label }}</span>
            <UBadge 
              v-if="option.count !== undefined"
              color="primary"
              :variant="modelValue === option.value ? 'solid' : 'subtle'"
            >
              {{ option.count }}
            </UBadge>
          </span>
        </UButton>
        <DateSelect
          :model-value="dueDate"
          label="Filter by Due Date"
          @update:model-value="emit('update:dueDate', $event)"
        />
      </div>
    </div>
    
  </div>
</template>
