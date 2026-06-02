import type { CanvasElement, ElementType, Project } from '../types'

export interface CreateCanvasElementInput {
  id: string
  type: ElementType
  parentId: string | null
  content?: Record<string, unknown>
  classList?: string[]
  inlineStyle?: Record<string, string>
}

export function createCanvasElement(input: CreateCanvasElementInput): CanvasElement {
  return {
    id: input.id,
    type: input.type,
    parentId: input.parentId,
    children: [],
    content: input.content ?? {},
    classList: input.classList ?? [],
    inlineStyle: input.inlineStyle,
  }
}

export function insertChild(project: Project, parentId: string, childId: string, index?: number): Project {
  const parent = project.nodes[parentId]
  const child = project.nodes[childId]

  if (!parent || !child) return project
  if (parent.children.includes(childId)) return project

  const nextChildren = [...parent.children]
  if (index === undefined || index < 0 || index > nextChildren.length) {
    nextChildren.push(childId)
  } else {
    nextChildren.splice(index, 0, childId)
  }

  return {
    ...project,
    nodes: {
      ...project.nodes,
      [parentId]: { ...parent, children: nextChildren },
      [childId]: { ...child, parentId },
    },
    updatedAt: new Date().toISOString(),
    version: project.version + 1,
  }
}

export function reorderChild(project: Project, parentId: string, fromIndex: number, toIndex: number): Project {
  const parent = project.nodes[parentId]
  if (!parent) return project

  const nextChildren = [...parent.children]
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= nextChildren.length ||
    toIndex >= nextChildren.length ||
    fromIndex === toIndex
  ) {
    return project
  }

  const [moved] = nextChildren.splice(fromIndex, 1)
  nextChildren.splice(toIndex, 0, moved)

  return {
    ...project,
    nodes: {
      ...project.nodes,
      [parentId]: { ...parent, children: nextChildren },
    },
    updatedAt: new Date().toISOString(),
    version: project.version + 1,
  }
}

export function updateElementInlineStyle(
  project: Project,
  elementId: string,
  stylePatch: Record<string, string>,
): Project {
  const element = project.nodes[elementId]
  if (!element) return project

  return {
    ...project,
    nodes: {
      ...project.nodes,
      [elementId]: {
        ...element,
        inlineStyle: {
          ...(element.inlineStyle ?? {}),
          ...stylePatch,
        },
      },
    },
    updatedAt: new Date().toISOString(),
    version: project.version + 1,
  }
}

export function updateElementContent(
  project: Project,
  elementId: string,
  contentPatch: Record<string, unknown>,
): Project {
  const element = project.nodes[elementId]
  if (!element) return project

  return {
    ...project,
    nodes: {
      ...project.nodes,
      [elementId]: {
        ...element,
        content: {
          ...element.content,
          ...contentPatch,
        },
      },
    },
    updatedAt: new Date().toISOString(),
    version: project.version + 1,
  }
}
