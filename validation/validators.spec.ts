import { describe, it, expect } from 'vitest'
import { taskTitleValid, taskDescriptionValid } from './validators'
import { TASK_VALIDATION } from './constants'

describe('taskTitleValid', () => {
  it('should return true for valid title', () => {
    expect(taskTitleValid('Valid task title')).toBe(true)
  })

  it('should return false for empty string', () => {
    expect(taskTitleValid('')).toBe(false)
  })

  it('should return false for whitespace only string', () => {
    expect(taskTitleValid('   ')).toBe(false)
  })

  it('should return false for undefined', () => {
    expect(taskTitleValid(undefined)).toBe(false)
  })

  it('should return false for null', () => {
    expect(taskTitleValid(null)).toBe(false)
  })

  it('should return false for title exceeding max length', () => {
    const longTitle = 'a'.repeat(TASK_VALIDATION.TITLE_MAX_LENGTH + 1)
    expect(taskTitleValid(longTitle)).toBe(false)
  })

  it('should return true for title at max length', () => {
    const maxTitle = 'a'.repeat(TASK_VALIDATION.TITLE_MAX_LENGTH)
    expect(taskTitleValid(maxTitle)).toBe(true)
  })
})

describe('taskDescriptionValid', () => {
  it('should return true for valid description', () => {
    expect(taskDescriptionValid('Valid task description')).toBe(true)
  })

  it('should return true for empty string', () => {
    expect(taskDescriptionValid('')).toBe(true)
  })

  it('should return true for undefined (optional field)', () => {
    expect(taskDescriptionValid(undefined)).toBe(true)
  })

  it('should return true for null (optional field)', () => {
    expect(taskDescriptionValid(null)).toBe(true)
  })

  it('should return false for description exceeding max length', () => {
    const longDescription = 'a'.repeat(TASK_VALIDATION.DESCRIPTION_MAX_LENGTH + 1)
    expect(taskDescriptionValid(longDescription)).toBe(false)
  })

  it('should return true for description at max length', () => {
    const maxDescription = 'a'.repeat(TASK_VALIDATION.DESCRIPTION_MAX_LENGTH)
    expect(taskDescriptionValid(maxDescription)).toBe(true)
  })
})
