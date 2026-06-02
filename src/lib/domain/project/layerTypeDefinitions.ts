export type LayerType = 'section' | 'header' | 'text' | 'columns' | 'picture'

export interface LayerTypeDefinition {
  type: LayerType
  defaultName: string
  defaultProps: Record<string, unknown>
  allowedParentTypes: Array<LayerType | 'root'>
  allowedChildTypes: LayerType[]
  inspectorSchemaKey: string
  icon: string
}

const LAYER_TYPE_DEFINITIONS: Record<LayerType, LayerTypeDefinition> = {
  section: {
    type: 'section',
    defaultName: 'Section',
    defaultProps: {},
    allowedParentTypes: ['root', 'section'],
    allowedChildTypes: ['header', 'text', 'columns', 'picture', 'section'],
    inspectorSchemaKey: 'section',
    icon: '▭',
  },
  header: {
    type: 'header',
    defaultName: 'Header',
    defaultProps: {
      headerLevel: 'h2',
      text: 'Heading',
    },
    allowedParentTypes: ['section'],
    allowedChildTypes: [],
    inspectorSchemaKey: 'header',
    icon: 'H',
  },
  text: {
    type: 'text',
    defaultName: 'Text',
    defaultProps: {
      content: '',
      link: null,
    },
    allowedParentTypes: ['section'],
    allowedChildTypes: [],
    inspectorSchemaKey: 'text',
    icon: 'T',
  },
  columns: {
    type: 'columns',
    defaultName: 'Columns',
    defaultProps: {
      columnCount: 2,
      gap: '1rem',
      collapseBreakpointPx: 768,
      manualWidths: null,
      normalizedWidths: null,
    },
    allowedParentTypes: ['section'],
    allowedChildTypes: [],
    inspectorSchemaKey: 'columns',
    icon: '⊞',
  },
  picture: {
    type: 'picture',
    defaultName: 'Picture',
    defaultProps: {
      assetRef: '',
      alt: '',
      caption: '',
    },
    allowedParentTypes: ['section'],
    allowedChildTypes: [],
    inspectorSchemaKey: 'picture',
    icon: '🖼',
  },
}

export function getLayerTypeDefinition(type: LayerType): LayerTypeDefinition {
  return LAYER_TYPE_DEFINITIONS[type]
}

export function getAllLayerTypeDefinitions(): LayerTypeDefinition[] {
  return Object.values(LAYER_TYPE_DEFINITIONS)
}

export function isValidParentChildRelationship(
  parentType: LayerType | 'root',
  childType: LayerType,
): boolean {
  const childDef = LAYER_TYPE_DEFINITIONS[childType]
  return childDef.allowedParentTypes.includes(parentType)
}

export function getAllowedChildTypes(parentType: LayerType | 'root'): LayerType[] {
  if (parentType === 'root') {
    return ['section']
  }
  const parentDef = LAYER_TYPE_DEFINITIONS[parentType]
  return parentDef.allowedChildTypes
}
