<script setup lang="ts">
import { computed } from 'vue'
import type { TaskStatus } from '../../../../types'

interface Props {
	status: TaskStatus
}

const props = defineProps<Props>()

/*
  "error" | "neutral" | "primary" | "secondary" | "success" | "info" | "warning"
*/

const statusMeta = computed(() => {
	switch (props.status) {
		case 'completed':
			return {
				label: 'Completed',
				color: 'success' as const
			}
		case 'in-progress':
			return {
				label: 'In Progress',
				color: 'primary' as const
			}
		case 'pending':
			return {
				label: 'Pending',
				color: 'warning' as const
			}
		default:
			return {
				label: 'Unknown',
				color: 'neutral' as const
			}
	}
})
</script>

<template>
	<UBadge :color="statusMeta.color" variant="solid">
		{{ statusMeta.label }}
	</UBadge>
</template>
