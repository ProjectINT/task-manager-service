<script setup lang="ts">
import { computed } from 'vue'
import { useTasksStore } from '../../../store/tasks'
import type { Task } from '../../../../types'
import StatusBadge from './StatusBadge.vue'
import TaskActions from './TaskActions.vue'

interface Props {
	taskId: Task['id']
	disabled?: boolean
}

const props = defineProps<Props>()

const tasksStore = useTasksStore()

const task = computed(() => tasksStore.getTaskById(props.taskId))

const dueDateLabel = computed(() => {
	if (!task.value?.dueDate) {
		return null
	}

	const date = new Date(task.value.dueDate)
	if (Number.isNaN(date.getTime())) {
		return null
	}
	return date.toLocaleDateString()
})
</script>

<template>
	<UCard v-if="task">
    <template #header>
      <div class="flex flex-wrap items-center gap-2 mb-2">
        <h3 class="text-lg font-semibold">
          {{ task.title }}
        </h3>
        <StatusBadge :status="task.status" />
      </div>
    </template>

		<div class="flex-1">
			<p v-if="task.description" class="text-gray-600 dark:text-gray-400 mb-2">
				{{ task.description }}
			</p>

			<p v-if="dueDateLabel" class="text-sm text-gray-500 dark:text-gray-500">
				Due {{ dueDateLabel }}
			</p>
		</div>

    <template #footer>
      <TaskActions
        :task-id="taskId"
        :disabled="disabled"
      />
    </template>
	</UCard>
</template>
