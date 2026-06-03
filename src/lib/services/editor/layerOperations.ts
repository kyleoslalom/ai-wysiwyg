import type { LayerNode } from '../../domain/schemas/layerNodeSchema'
import type { LayerType } from '../../domain/project/layerTypeDefinitions'
import type { RichProject } from '../../domain/schemas/projectSchema'
import { canAddChildOfType } from '../validator/layerTreeValidator'
import { createDefaultNode } from './nodeFactory'
import { sanitizeLayerName } from '../validator/inputSanitizer'

export interface LayerOperationResult {
  project: RichProject
  newNodeId?: string
  error?: string
}

export function addLayer(
  project: RichProject,
  parentNodeId: string,
  type: LayerType,
  name?: string,
): LayerOperationResult {
  const effectiveParentId = parentNodeId === 'root' ? project.rootNodeId : parentNodeId

  if (!canAddChildOfType(project.nodes, effectiveParentId, type)) {
    const parentNode = project.nodes[effectiveParentId]
    const parentType = parentNode?.parentId === null ? 'root' : (parentNode?.type ?? 'unknown')
    return {
      project,
      error: `Cannot add "${type}" as a child of "${parentType}". Check layer nesting rules.`,
    }
  }

  const newNode = createDefaultNode(type, effectiveParentId, {
    name: name ? sanitizeLayerName(name) : undefined,
  })

  const parent = project.nodes[effectiveParentId]
  if (!parent) {
    return { project, error: `Parent node "${effectiveParentId}" not found` }
  }

  const updatedProject: RichProject = {
    ...project,
    nodes: {
      ...project.nodes,
      [newNode.id]: newNode,
      [effectiveParentId]: {
        ...parent,
        children: [...parent.children, newNode.id],
      },
    },
    updatedAt: new Date().toISOString(),
  }

  return { project: updatedProject, newNodeId: newNode.id }
}

export function renameLayer(
  project: RichProject,
  nodeId: string,
  name: string,
): LayerOperationResult {
  const node = project.nodes[nodeId]
  if (!node) return { project, error: `Node "${nodeId}" not found` }
  const sanitized = sanitizeLayerName(name)
  if (!sanitized) return { project, error: 'Layer name cannot be empty' }

  return {
    project: {
      ...project,
      nodes: { ...project.nodes, [nodeId]: { ...node, name: sanitized } },
      updatedAt: new Date().toISOString(),
    },
  }
}

export function deleteLayer(project: RichProject, nodeId: string): LayerOperationResult {
  const node = project.nodes[nodeId]
  if (!node) return { project, error: `Node "${nodeId}" not found` }
  if (node.id === project.rootNodeId) return { project, error: 'Cannot delete root node' }

  const newNodes = { ...project.nodes }

  // Recursively collect all descendant IDs to remove
  const toRemove = collectDescendants(project.nodes, nodeId)
  toRemove.forEach((id) => delete newNodes[id])

  // Remove from parent
  if (node.parentId && newNodes[node.parentId]) {
    const parent = newNodes[node.parentId]!
    newNodes[node.parentId] = {
      ...parent,
      children: parent.children.filter((c) => c !== nodeId),
    }
  }

  return {
    project: { ...project, nodes: newNodes, updatedAt: new Date().toISOString() },
  }
}

function collectDescendants(nodes: Record<string, LayerNode>, nodeId: string): string[] {
  const result: string[] = [nodeId]
  const node = nodes[nodeId]
  if (!node) return result
  for (const childId of node.children) {
    result.push(...collectDescendants(nodes, childId))
  }
  return result
}

export function reorderLayer(
  project: RichProject,
  parentNodeId: string,
  nodeId: string,
  newIndex: number,
): LayerOperationResult {
  const parent = project.nodes[parentNodeId]
  if (!parent) return { project, error: `Parent node "${parentNodeId}" not found` }
  if (!parent.children.includes(nodeId)) {
    return { project, error: `Node "${nodeId}" is not a child of "${parentNodeId}"` }
  }

  const children = parent.children.filter((c) => c !== nodeId)
  const clampedIndex = Math.max(0, Math.min(newIndex, children.length))
  children.splice(clampedIndex, 0, nodeId)

  return {
    project: {
      ...project,
      nodes: { ...project.nodes, [parentNodeId]: { ...parent, children } },
      updatedAt: new Date().toISOString(),
    },
  }
}

export function duplicateLayer(project: RichProject, nodeId: string): LayerOperationResult {
  const node = project.nodes[nodeId]
  if (!node) return { project, error: `Node "${nodeId}" not found` }
  if (node.id === project.rootNodeId) return { project, error: 'Cannot duplicate root node' }

  const newId = `${node.type}-copy-${Date.now()}`
  const newNode: LayerNode = { ...structuredClone(node), id: newId }
  const newNodes: Record<string, LayerNode> = { ...project.nodes, [newId]: newNode }

  if (node.parentId && newNodes[node.parentId]) {
    const parent = newNodes[node.parentId]!
    const idx = parent.children.indexOf(nodeId)
    const newChildren = [...parent.children]
    newChildren.splice(idx + 1, 0, newId)
    newNodes[node.parentId] = { ...parent, children: newChildren }
  }

  return {
    project: { ...project, nodes: newNodes, updatedAt: new Date().toISOString() },
    newNodeId: newId,
  }
}

export function moveLayer(
  project: RichProject,
  nodeId: string,
  targetParentId: string,
  targetIndex: number,
): LayerOperationResult {
  const node = project.nodes[nodeId]
  if (!node) return { project, error: `Node "${nodeId}" not found` }
  if (node.id === project.rootNodeId) return { project, error: 'Cannot move root node' }

  const targetParent = project.nodes[targetParentId]
  if (!targetParent) return { project, error: `Target parent "${targetParentId}" not found` }

  const targetType = targetParent.parentId === null ? 'root' : targetParent.type
  if (!canAddChildOfType(project.nodes, targetParentId, node.type as LayerType)) {
    return {
      project,
      error: `Cannot move "${node.type}" under "${targetType}". Check nesting rules.`,
    }
  }

  const newNodes = { ...project.nodes }

  // Remove from old parent
  if (node.parentId && newNodes[node.parentId]) {
    const oldParent = newNodes[node.parentId]!
    newNodes[node.parentId] = {
      ...oldParent,
      children: oldParent.children.filter((c) => c !== nodeId),
    }
  }

  // Update node parentId
  newNodes[nodeId] = { ...node, parentId: targetParentId }

  // Add to new parent
  const updatedTarget = newNodes[targetParentId]!
  const newChildren = [...updatedTarget.children]
  const clampedIndex = Math.max(0, Math.min(targetIndex, newChildren.length))
  newChildren.splice(clampedIndex, 0, nodeId)
  newNodes[targetParentId] = { ...updatedTarget, children: newChildren }

  return {
    project: { ...project, nodes: newNodes, updatedAt: new Date().toISOString() },
  }
}
