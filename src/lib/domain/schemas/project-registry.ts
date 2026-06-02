import type { ProjectMetadata, ProjectRegistry } from '../types'

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function isIsoDate(value: unknown): value is string {
  return isString(value) && !Number.isNaN(Date.parse(value))
}

function isProjectMetadata(value: unknown): value is ProjectMetadata {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    isString(v.id) &&
    isString(v.name) &&
    isIsoDate(v.createdAt) &&
    isIsoDate(v.updatedAt) &&
    Number.isInteger(v.version) &&
    (v.version as number) >= 1
  )
}

export function isProjectRegistry(value: unknown): value is ProjectRegistry {
  if (!value || typeof value !== 'object') return false

  const v = value as Record<string, unknown>
  const activeProjectId = v.activeProjectId
  const activeValid = activeProjectId === null || isString(activeProjectId)
  const schemaValid = Number.isInteger(v.schemaVersion) && (v.schemaVersion as number) >= 1
  const projects = v.projects

  if (!activeValid || !schemaValid || !projects || typeof projects !== 'object') {
    return false
  }

  for (const item of Object.values(projects as Record<string, unknown>)) {
    if (!isProjectMetadata(item)) {
      return false
    }
  }

  if (typeof activeProjectId === 'string' && !(activeProjectId in (projects as Record<string, unknown>))) {
    return false
  }

  if (v.lastOpenedAt !== undefined && !isIsoDate(v.lastOpenedAt)) {
    return false
  }

  return true
}
