<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTasksStore } from '../../store/tasks'

const tasksStore = useTasksStore()
const { filteredTasks, loading } = storeToRefs(tasksStore)

const hasTasks = computed(() => filteredTasks.value.length > 0)
</script>

<template>
	<section class="space-y-6">

		<TasksListFilter />

		<TasksListTasksCount />

		<div v-if="loading" class="space-y-2">
				<USkeleton v-for="index in 3" :key="index" class="h-20" />
		</div>

		<TasksListEmptyState v-else-if="!hasTasks" />

		<div v-else class="space-y-2">
			<TransitionGroup name="list" tag="div" class="space-y-2">
				<TasksListItem
					v-for="task in filteredTasks"
					:key="task.id"
					:task-id="task.id"
				/>
			</TransitionGroup>
		</div>
	</section>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
	transition: all 0.2s ease;
}

.list-enter-from,
.list-leave-to {
	opacity: 0;
	transform: translateY(8px);
}
</style>
