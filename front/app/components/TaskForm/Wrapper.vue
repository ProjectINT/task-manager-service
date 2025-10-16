<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToast } from '#imports'
import { useTasksStore } from '../../store/tasks'
import type { Task } from '../../../types'
import type { TaskFormValues } from './index.vue'

interface Props {
  open: boolean
  taskId?: Task['id'] | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const tasksStore = useTasksStore()
const toast = useToast()

const isMutating = ref(false)

const selectedTask = computed<Task | null>(() => {
  if (!props.taskId) return null
  return tasksStore.getTaskById(props.taskId) ?? null
})

const mode = computed(() => (selectedTask.value ? 'edit' : 'create'))
const headline = computed(() => (mode.value === 'edit' ? 'Edit task' : 'Create task'))

function close() {
  emit('close')
}

async function handleSubmit(values: TaskFormValues) {
  isMutating.value = true
  
  try {
    if (selectedTask.value) {
      // Update existing task
      tasksStore.updateTask(selectedTask.value.id, {
        title: values.title,
        description: values.description,
        status: values.status,
        dueDate: values.dueDate ?? undefined
      })
      toast.add({ title: 'Task updated', color: 'success' })
    } else {
      // Create new task
      await tasksStore.createTask({
        title: values.title,
        description: values.description,
        status: values.status ?? 'pending',
        dueDate: values.dueDate ?? undefined
      })
      toast.add({ title: 'Task created', color: 'success' })
    }
    close()
  } catch (err) {
    const message = err instanceof Error ? err.message : `Failed to ${mode.value} task`
    toast.add({ title: 'Error', description: message, color: 'error' })
  } finally {
    isMutating.value = false
  }
}
</script>

<template>
  <UModal
    :open="open"
    :close="false"
    class="max-w-lg"
    @update:open="(value: boolean) => { if (!value) close() }"
  >
    <template #header>
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-xl font-semibold">{{ headline }}</h2>
          <p class="text-sm text-gray-500 mt-1">
            {{ mode === 'edit' ? 'Update the selected task.' : 'Provide details for the new task.' }}
          </p>
        </div>
        <UButton
          icon="i-heroicons-x-mark"
          color="neutral"
          variant="ghost"
          :disabled="isMutating"
          @click="close"
        />
      </div>
    </template>

    <template #content>
      <TaskForm
        :task="selectedTask"
        :mode="mode"
        :loading="isMutating"
        @submit="handleSubmit"
        @cancel="close"
      />
    </template>
  </UModal>
</template>
