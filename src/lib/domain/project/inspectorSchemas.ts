import type { LayerType } from './layerTypeDefinitions'
import type { LayerNode } from '../schemas/layerNodeSchema'

export type InspectorFieldType =
  | 'text'
  | 'textarea'
  | 'color'
  | 'select'
  | 'number'
  | 'toggle'
  | 'asset-picker'

export interface SelectOption {
  value: string
  label: string
}

export interface InspectorField {
  key: string
  label: string
  type: InspectorFieldType
  placeholder?: string
  options?: SelectOption[]
  min?: number
  max?: number
  required?: boolean
  helpText?: string
}

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  min?: number
  max?: number
  message: string
}

export interface InspectorSchema {
  key: string
  commonFields: InspectorField[]
  typeFields: Partial<Record<LayerType, InspectorField[]>>
  validators: Record<string, ValidationRule>
}

const COMMON_FIELDS: InspectorField[] = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'Layer name',
    required: true,
  },
  {
    key: 'visible',
    label: 'Visible',
    type: 'toggle',
  },
  {
    key: 'textColor',
    label: 'Text Color',
    type: 'color',
  },
]

const HEADER_FIELDS: InspectorField[] = [
  {
    key: 'headerLevel',
    label: 'Heading Level',
    type: 'select',
    options: [
      { value: 'h1', label: 'H1' },
      { value: 'h2', label: 'H2' },
      { value: 'h3', label: 'H3' },
      { value: 'h4', label: 'H4' },
      { value: 'h5', label: 'H5' },
      { value: 'h6', label: 'H6' },
    ],
    required: true,
  },
  {
    key: 'text',
    label: 'Heading Text',
    type: 'text',
    placeholder: 'Enter heading text...',
    required: true,
  },
]

const TEXT_FIELDS: InspectorField[] = [
  {
    key: 'content',
    label: 'Text Content',
    type: 'textarea',
    placeholder: 'Enter text content...',
  },
  {
    key: 'link',
    label: 'Link URL',
    type: 'text',
    placeholder: 'https://example.com',
    helpText: 'Leave blank for no link',
  },
]

const COLUMNS_FIELDS: InspectorField[] = [
  {
    key: 'columnCount',
    label: 'Column Count',
    type: 'number',
    min: 1,
    max: 6,
    required: true,
  },
  {
    key: 'gap',
    label: 'Gap',
    type: 'text',
    placeholder: '1rem',
    required: true,
    helpText: 'CSS gap value (e.g. 1rem, 16px)',
  },
  {
    key: 'collapseBreakpointPx',
    label: 'Collapse below (px)',
    type: 'number',
    min: 0,
    max: 2560,
    helpText: 'Columns collapse to single column below this viewport width. Default: 768.',
  },
  {
    key: 'manualWidths',
    label: 'Column Widths (%)',
    type: 'text',
    placeholder: '50, 50',
    helpText: 'Comma-separated percentages. Must total 100%.',
  },
]

const PICTURE_FIELDS: InspectorField[] = [
  {
    key: 'assetRef',
    label: 'Image Asset',
    type: 'asset-picker',
    helpText: 'Select an embedded image from the asset library',
  },
  {
    key: 'alt',
    label: 'Alt Text',
    type: 'text',
    placeholder: 'Describe the image for accessibility',
    required: true,
  },
  {
    key: 'caption',
    label: 'Caption',
    type: 'text',
    placeholder: 'Optional figure caption',
  },
]

const SECTION_FIELDS: InspectorField[] = [
  {
    key: 'padding',
    label: 'Padding',
    type: 'text',
    placeholder: '1rem',
    helpText: 'CSS padding value',
  },
  {
    key: 'background',
    label: 'Background',
    type: 'color',
  },
]

const INSPECTOR_SCHEMAS: Record<string, InspectorSchema> = {
  header: {
    key: 'header',
    commonFields: COMMON_FIELDS,
    typeFields: { header: HEADER_FIELDS },
    validators: {
      text: { required: true, minLength: 1, maxLength: 500, message: 'Heading text is required' },
      headerLevel: { required: true, message: 'Heading level is required' },
    },
  },
  text: {
    key: 'text',
    commonFields: COMMON_FIELDS,
    typeFields: { text: TEXT_FIELDS },
    validators: {
      content: { maxLength: 10000, message: 'Text content is too long' },
      link: { pattern: /^(https?:\/\/|\/|#|mailto:)/, message: 'Link must be a valid URL' },
    },
  },
  columns: {
    key: 'columns',
    commonFields: COMMON_FIELDS,
    typeFields: { columns: COLUMNS_FIELDS },
    validators: {
      columnCount: { required: true, min: 1, max: 6, message: 'Column count must be 1-6' },
      gap: { required: true, minLength: 1, message: 'Gap is required' },
    },
  },
  picture: {
    key: 'picture',
    commonFields: COMMON_FIELDS,
    typeFields: { picture: PICTURE_FIELDS },
    validators: {
      alt: { required: true, minLength: 1, maxLength: 500, message: 'Alt text is required for accessibility' },
    },
  },
  section: {
    key: 'section',
    commonFields: COMMON_FIELDS,
    typeFields: { section: SECTION_FIELDS },
    validators: {},
  },
}

export function getSchemaForType(type: LayerType): InspectorSchema {
  return INSPECTOR_SCHEMAS[type] ?? INSPECTOR_SCHEMAS['section']!
}

export function getInspectorSchema(node: LayerNode): InspectorSchema {
  return getSchemaForType(node.type)
}
