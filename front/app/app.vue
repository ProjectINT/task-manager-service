<script setup lang="ts">
import { onMounted } from 'vue'

import { useTasksStore } from './store/tasks'

const tasksStore = useTasksStore()

function openCreateForm() {
  tasksStore.openTaskCreateForm()
}

function closeForm() {
  tasksStore.closeTaskForm()
}

onMounted(() => {
  tasksStore.initialize()
})

useHead({
  title: 'Task Manager'
})
</script>

<template>
  <UApp>
    <UContainer>
      <TasksHeader @create-task="openCreateForm" />
      <ErrorAlert />

      <TasksList />

      <ClientOnly>
        <TaskFormWrapper
          :open="tasksStore.isTaskFormOpen"
          :task-id="tasksStore.editingTaskId"
          @close="closeForm"
        />
      </ClientOnly>
    </UContainer>

  </UApp>
</template>
