<script setup lang="ts">
import type { TaskStatus } from '../../types'
import { getStatusOptions } from '../utils/taskStatus'

const props = defineProps<{
  modelValue: TaskStatus
  disabled?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: TaskStatus): void
}>()
</script>

<template>
  <USelect
    :model-value="props.modelValue as any"
    :options="getStatusOptions(false) as any"
    :disabled="props.disabled || props.loading"
    class="w-full"
    @update:model-value="emit('update:modelValue', $event as TaskStatus)"
  />
</template>
