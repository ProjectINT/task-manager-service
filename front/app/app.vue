<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { useTasksStore } from './store/tasks'

import type { Task } from '../types'

const tasksStore = useTasksStore()

const loading = computed(() => tasksStore.loading)

function openCreateForm() {
  tasksStore.openTaskCreateForm()
}

function openEditForm(taskId: Task['id']) {
  tasksStore.openTaskEditForm(taskId)
}

function closeForm() {
  tasksStore.closeTaskForm()
}

onMounted(() => {
  if (!tasksStore.tasks.length) {
    tasksStore.fetchTasks()
  }
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

      <TasksList
        :loading="loading"
        @edit-task="openEditForm"
      />

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
