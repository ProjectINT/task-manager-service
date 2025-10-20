import { TASK_VALIDATION } from './constants'

/**
 * Validate task title
 * @param title - The title to validate
 * @returns true if valid, false otherwise
 */
export function taskTitleValid(title: string | undefined | null): boolean {
  if (title === undefined || title === null) {
    return false
  }

  const trimmedTitle = title.trim()

  if (trimmedTitle.length === 0) {
    return false
  }

  if (title.length > TASK_VALIDATION.TITLE_MAX_LENGTH) {
    return false
  }

  return true
}

/**
 * Validate task description
 * @param description - The description to validate
 * @returns true if valid, false otherwise
 */
export function taskDescriptionValid(description: string | undefined | null): boolean {
  // Description is optional, so undefined or null is valid
  if (description === undefined || description === null) {
    return true
  }

  if (description.length > TASK_VALIDATION.DESCRIPTION_MAX_LENGTH) {
    return false
  }

  return true
}
