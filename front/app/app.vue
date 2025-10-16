<script setup lang="ts">

import { computed, onMounted, ref } from 'vue'

import { useTasksStore } from './store/tasks'

import type { Task } from '../types'

const tasksStore = useTasksStore()

const isFormOpen = ref(false)

const editingTaskId = ref<Task['id'] | null>(null)

const loading = computed(() => tasksStore.loading)

function openCreateForm() {
  editingTaskId.value = null
  isFormOpen.value = true
}

function openEditForm(taskId: Task['id']) {
  editingTaskId.value = taskId
  isFormOpen.value = true
}

function closeForm() {
  isFormOpen.value = false
  editingTaskId.value = null
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
      >
        <template #actions>
          <UButton icon="i-heroicons-plus" @click="openCreateForm">
            Add task
          </UButton>
        </template>

        <template #empty-action>
          <UButton @click="openCreateForm">
            Create first task
          </UButton>
        </template>
      </TasksList>

      <ClientOnly>
        <TaskFormWrapper
          :open="isFormOpen"
          :task-id="editingTaskId"
          @close="closeForm"
        />
      </ClientOnly>
    </UContainer>

  </UApp>
</template>
