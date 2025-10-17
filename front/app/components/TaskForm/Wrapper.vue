<script setup lang="ts">

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
console.log('headline.value',headline.value)

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
      });

      toast.add({ title: 'Task updated', color: 'success' });
    } else {
      // Create new task
      await tasksStore.createTask({
        title: values.title,
        description: values.description,
        status: values.status ?? 'pending',
        dueDate: values.dueDate ?? undefined
      });

      toast.add({ title: 'Task created', color: 'success' });
    }

    close();
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
    @update:open="(val: boolean) => { if (!val) close() }"
    :title="headline"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <TaskForm
        :task="selectedTask"
        :mode="mode"
        :loading="isMutating"
        @submit="handleSubmit"
        @cancel="close"
      />
    </template>

    <template #footer>
      <div class="flex gap-3 justify-end">
        <UButton
          type="button"
          color="neutral"
          variant="ghost"
          :disabled="isMutating"
          @click="close"
        >
          Cancel
        </UButton>
        <UButton
          type="submit"
          form="task-form"
          :loading="isMutating"
        >
          {{ mode === 'edit' ? 'Save changes' : 'Create task' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
