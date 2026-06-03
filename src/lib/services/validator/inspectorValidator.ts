import type { LayerNode } from '../../domain/schemas/layerNodeSchema'
import { getInspectorSchema } from '../../domain/project/inspectorSchemas'
import { sanitizePlainText, sanitizeUrl, sanitizeAltText, sanitizeLayerName, sanitizeCssValue } from './inputSanitizer'

export interface FieldError {
  field: string
  message: string
}

export interface InspectorValidationResult {
  valid: boolean
  errors: FieldError[]
}

export function validateNodeProps(node: LayerNode): InspectorValidationResult {
  const schema = getInspectorSchema(node)
  const errors: FieldError[] = []

  // Validate name (common field)
  if (!node.name || node.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Layer name is required' })
  }

  // Validate type-specific fields
  if (node.type === 'header') {
    const props = node.props as { headerLevel?: string; text?: string }
    const validator = schema.validators['text']
    if (validator?.required && (!props.text || props.text.trim().length === 0)) {
      errors.push({ field: 'text', message: validator.message })
    }
    if (!props.headerLevel) {
      errors.push({ field: 'headerLevel', message: 'Heading level is required' })
    }
  }

  if (node.type === 'text') {
    const props = node.props as { content?: string; link?: { href?: string } | null }
    const validator = schema.validators['content']
    if (validator?.maxLength && props.content && props.content.length > validator.maxLength) {
      errors.push({ field: 'content', message: validator.message })
    }
    if (props.link?.href) {
      const linkValidator = schema.validators['link']
      if (linkValidator?.pattern && !linkValidator.pattern.test(props.link.href)) {
        errors.push({ field: 'link', message: linkValidator.message })
      }
    }
  }

  if (node.type === 'columns') {
    const props = node.props as { columnCount?: number; gap?: string }
    const countValidator = schema.validators['columnCount']
    if (countValidator) {
      if (!props.columnCount) {
        errors.push({ field: 'columnCount', message: countValidator.message })
      } else if (
        (countValidator.min !== undefined && props.columnCount < countValidator.min) ||
        (countValidator.max !== undefined && props.columnCount > countValidator.max)
      ) {
        errors.push({ field: 'columnCount', message: countValidator.message })
      }
    }
    if (!props.gap || props.gap.trim().length === 0) {
      errors.push({ field: 'gap', message: 'Gap is required' })
    }
  }

  if (node.type === 'picture') {
    const props = node.props as { alt?: string }
    const altValidator = schema.validators['alt']
    if (altValidator?.required && (!props.alt || props.alt.trim().length === 0)) {
      errors.push({ field: 'alt', message: altValidator.message })
    }
  }

  return { valid: errors.length === 0, errors }
}

export function sanitizeNodePropValue(key: string, value: unknown): unknown {
  if (typeof value !== 'string') return value

  switch (key) {
    case 'name':
      return sanitizeLayerName(value)
    case 'text':
    case 'content':
      return sanitizePlainText(value)
    case 'link':
    case 'href':
      return sanitizeUrl(value)
    case 'alt':
      return sanitizeAltText(value)
    case 'gap':
    case 'padding':
    case 'margin':
      return sanitizeCssValue(value)
    default:
      return sanitizePlainText(value)
  }
}
