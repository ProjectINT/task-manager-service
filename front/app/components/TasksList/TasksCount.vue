<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTasksStore } from '../../store/tasks'

const tasksStore = useTasksStore()
const { tasks, filter, totalTasks, currentPage, totalPages } = storeToRefs(tasksStore)

const hasActiveFilters = computed(() => {
  return filter.value.type !== null || filter.value.dueDate !== null
})

const title = computed(() => {
  const visibleCount = tasks.value.length
  const totalCount = totalTasks.value

  if (hasActiveFilters.value) {
    return `Showing ${visibleCount} of ${totalCount} tasks (filtered)`
  }

  return `Showing ${visibleCount} of ${totalCount} tasks (page ${currentPage.value}/${totalPages.value})`
})

const handleClearFilters = async () => {
  await tasksStore.clearFilters()
}
</script>

<template>
  <div class="flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
    <div class="flex items-center gap-3">
      <UIcon name="i-lucide-list" class="size-5 text-gray-500 dark:text-gray-400" />
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ title }}</span>
    </div>

    <UButton
      v-if="hasActiveFilters"
      label="Clear filters"
      variant="outline"
      size="sm"
      @click="handleClearFilters"
    />
  </div>
</template>
