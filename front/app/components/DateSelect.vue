<script setup lang="ts">
/**
 * DateSelect - universal date picker component
 *
 * Uses standard v-model pattern for two-way binding.
 * Can be used anywhere in the application:
 *
 * 1. In filters (binding to store):
 *    <DateSelect v-model="tasksStore.dueDate" label="Filter by Due Date" />
 *
 * 2. In forms (binding to local state):
 *    const dueDate = ref<Date | null>(null)
 *    <DateSelect v-model="dueDate" label="Due date" />
 *
 * 3. With explicit binding (if more control is needed):
 *    <DateSelect
 *      :model-value="someDate"
 *      @update:model-value="handleDateChange"
 *    />
 */
import { computed, ref } from 'vue'
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'

const props = defineProps<{
  modelValue?: Date | null
  label?: string
}>()

// Standard emit for v-model pattern
// Vue automatically transforms v-model="value" into:
// :model-value="value" @update:model-value="value = $event"
const emit = defineEmits<{
  (e: 'update:modelValue', value: Date | null): void
}>()

const isOpen = ref(false)

// Date formatter for display
const df = new DateFormatter('ru-RU', {
  dateStyle: 'medium'
})

const displayDate = computed(() => {
  if (!props.modelValue) return 'Select due date'

  // Convert Date to CalendarDate in local timezone for display
  const localDate = props.modelValue.toLocaleDateString('en-CA') // YYYY-MM-DD format
  const calDate = parseDate(localDate)
  return df.format(calDate.toDate(getLocalTimeZone()))
})

const calendarValue = computed(() => {
  if (!props.modelValue) return null

  // Convert Date (stored as ISO UTC) to CalendarDate in user's local timezone
  const date = new Date(props.modelValue)
  const localDateString = date.toLocaleDateString('en-CA') // YYYY-MM-DD format

  return parseDate(localDateString)
})

const handleDateSelect = (date: any) => {
  if (!date) {
    emit('update:modelValue', null)
    isOpen.value = false
    return
  }

  // Handle CalendarDate type
  if (typeof date === 'object' && 'year' in date && 'month' in date && 'day' in date && !Array.isArray(date)) {
    // Convert CalendarDate to Date in UTC for storage
    const jsDate = (date as CalendarDate).toDate(getLocalTimeZone())
    emit('update:modelValue', jsDate)
    isOpen.value = false
  }
}

const clearDate = () => {
  emit('update:modelValue', null)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <label v-if="label" class="text-sm font-medium">
      {{ label }}
    </label>
    <div class="flex gap-2">
      <UPopover v-model="isOpen" class="flex-1">
        <UButton
          variant="outline"
          color="neutral"
          class="w-full justify-start"
          :class="{ 'text-gray-400': !modelValue }"
        >
          <template #leading>
            <UIcon name="i-heroicons-calendar-days" class="size-5" />
          </template>
          {{ displayDate }}
        </UButton>

        <template #content>
          <UCalendar
            :model-value="calendarValue"
            @update:model-value="handleDateSelect"
          />
        </template>
      </UPopover>

      <UButton
        v-if="modelValue"
        icon="i-heroicons-x-mark-20-solid"
        size="sm"
        color="neutral"
        variant="ghost"
        @click="clearDate"
      />
    </div>
  </div>
</template>
