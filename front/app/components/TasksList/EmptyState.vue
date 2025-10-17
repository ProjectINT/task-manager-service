<script setup lang="ts">
import { useTasksStore } from '../../store/tasks'

const tasksStore = useTasksStore()

function handleCreate() {
	tasksStore.openTaskCreateForm()
}
</script>

<template>
	<div class="text-center py-8">
		<UIcon name="i-heroicons-clipboard-document-check" class="text-4xl mb-2" />
		<h3 class="text-lg font-semibold mb-2">No tasks yet</h3>
		<p class="text-gray-500 dark:text-gray-400 mb-4">
			Create your first task to get organized.
		</p>
		<UButton @click="handleCreate">
			Create first task
		</UButton>
	</div>
</template>
