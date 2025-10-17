<script setup lang="ts">
import type { TaskStatus } from '../../types'
import { getStatusOptions } from '../utils/taskStatus'

type Counts = Partial<Record<TaskStatus | 'all', number>>

const props = defineProps<{
  modelValue: TaskStatus | null
  disabled?: boolean
  loading?: boolean
  counts?: Counts
  includeAll?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: TaskStatus | null): void
}>()

const options = getStatusOptions(true)

function update(value: TaskStatus | null) {
  if (props.disabled || props.loading) return
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <UButton
      v-for="option in (props.includeAll ? options : options.slice(1))"
      :key="option.value ?? 'all'"
      :disabled="props.disabled || props.loading"
      :color="props.modelValue === option.value ? 'primary' : 'neutral'"
      :variant="props.modelValue === option.value ? 'solid' : 'soft'"
      size="sm"
      @click="update(option.value as TaskStatus | null)"
    >
      <span class="flex items-center gap-2">
        <span>{{ option.label }}</span>
        <UBadge
          v-if="props.counts && (option.value === null ? props.counts.all !== undefined : props.counts[option.value] !== undefined)"
          color="primary"
          :variant="props.modelValue === option.value ? 'solid' : 'subtle'"
        >
          {{ option.value === null ? props.counts?.all : props.counts?.[option.value as TaskStatus] }}
        </UBadge>
      </span>
    </UButton>
  </div>
</template>
