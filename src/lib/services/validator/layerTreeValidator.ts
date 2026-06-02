import type { LayerNode } from '../../domain/schemas/layerNodeSchema'
import type { LayerType } from '../../domain/project/layerTypeDefinitions'
import { isValidParentChildRelationship } from '../../domain/project/layerTypeDefinitions'

export interface ValidationError {
  nodeId: string
  message: string
  code: string
}

export interface TreeValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export function validateLayerTree(
  nodes: Record<string, LayerNode>,
  rootNodeId: string,
): TreeValidationResult {
  const errors: ValidationError[] = []

  const rootNode = nodes[rootNodeId]
  if (!rootNode) {
    errors.push({
      nodeId: rootNodeId,
      message: 'Root node not found',
      code: 'ROOT_NOT_FOUND',
    })
    return { valid: false, errors }
  }

  if (rootNode.type !== 'section') {
    errors.push({
      nodeId: rootNodeId,
      message: `Root node must be of type "section", got "${rootNode.type}"`,
      code: 'INVALID_ROOT_TYPE',
    })
  }

  const visited = new Set<string>()
  validateNodeRecursive(nodes, rootNodeId, 'root', visited, errors)

  return { valid: errors.length === 0, errors }
}

function validateNodeRecursive(
  nodes: Record<string, LayerNode>,
  nodeId: string,
  parentType: LayerType | 'root',
  visited: Set<string>,
  errors: ValidationError[],
): void {
  if (visited.has(nodeId)) {
    errors.push({
      nodeId,
      message: `Cycle detected at node "${nodeId}"`,
      code: 'CYCLE_DETECTED',
    })
    return
  }
  visited.add(nodeId)

  const node = nodes[nodeId]
  if (!node) {
    errors.push({
      nodeId,
      message: `Node "${nodeId}" referenced but not found`,
      code: 'MISSING_NODE',
    })
    return
  }

  if (!isValidParentChildRelationship(parentType, node.type)) {
    errors.push({
      nodeId,
      message: `Node type "${node.type}" is not allowed under parent type "${parentType}"`,
      code: 'INVALID_PARENT_CHILD',
    })
  }

  // Determine effective parent type for children:
  // The root node (parentId === null) enforces root-level constraints (sections only).
  // All other section nodes use 'section' parent semantics.
  const effectiveParentType: LayerType | 'root' =
    node.parentId === null ? 'root' : node.type

  for (const childId of node.children) {
    const childNode = nodes[childId]
    if (!childNode) {
      errors.push({
        nodeId: childId,
        message: `Child node "${childId}" referenced by "${nodeId}" but not found`,
        code: 'MISSING_CHILD',
      })
      continue
    }

    if (childNode.parentId !== nodeId) {
      errors.push({
        nodeId: childId,
        message: `Child node "${childId}" has parentId "${childNode.parentId}" but is listed under "${nodeId}"`,
        code: 'INCONSISTENT_PARENT',
      })
    }

    validateNodeRecursive(nodes, childId, effectiveParentType, visited, errors)
  }
}

export function canAddChildOfType(
  nodes: Record<string, LayerNode>,
  parentNodeId: string | 'root',
  childType: LayerType,
): boolean {
  if (parentNodeId === 'root') {
    return childType === 'section'
  }

  const parent = nodes[parentNodeId]
  if (!parent) return false

  return isValidParentChildRelationship(parent.type, childType)
}
