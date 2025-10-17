<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTasksStore } from '../store/tasks'

/**
 * Emits
 */
const emit = defineEmits<{
  (event: 'create-task'): void
}>()

const tasksStore = useTasksStore()
const { tasksCountByStatus } = storeToRefs(tasksStore)

/**
 * Handle create task button click
 */
function handleCreateTask() {
  emit('create-task')
}
</script>

<template>
  <header class="flex flex-col py-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1>Task Manager</h1>
        <p>
          Keep track of ongoing work.
        </p>
      </div>
      <UButton
        icon="i-heroicons-plus"
        @click="handleCreateTask"
      >
        New task
      </UButton>
    </div>

    <div class="grid sm:grid-cols-3 gap-6 mt-6">
      <UCard>
        <div>
          <p>Total tasks</p>
          <p>{{ tasksStore.totalTasks }}</p>
        </div>
      </UCard>
      <UCard>
        <div>
          <p>In progress</p>
          <p>
            {{ tasksCountByStatus['in-progress'] ?? 0 }}
          </p>
        </div>
      </UCard>
      <UCard>
        <div>
          <p>Completed</p>
          <p>
            {{ tasksCountByStatus.completed ?? 0 }}
          </p>
        </div>
      </UCard>
    </div>
  </header>
</template>
