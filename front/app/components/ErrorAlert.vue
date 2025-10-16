<script setup lang="ts">
import { useTasksStore } from '../store/tasks'

const tasksStore = useTasksStore()
</script>

<template>
  <UAlert
    v-if="tasksStore.error"
    icon="i-heroicons-exclamation-triangle"
    color="error"
    variant="soft"
    title="Error"
    :description="tasksStore.error"
    :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'error', variant: 'link', padded: false }"
    @close="tasksStore.setError(null)"
  />
</template>
