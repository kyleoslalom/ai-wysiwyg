import { describe, it, expect } from 'vitest'
import type { LayerNode } from '../../src/lib/domain/schemas/layerNodeSchema'
import { getInspectorSchema, getSchemaForType } from '../../src/lib/domain/project/inspectorSchemas'

const defaultStyle = { spacing: {}, alignment: {}, background: {} }

function makeNode(type: LayerNode['type'], props: LayerNode['props'] = {}): LayerNode {
  return {
    id: 'test-node',
    type,
    parentId: 'sec-1',
    children: [],
    name: 'Test',
    visible: true,
    style: defaultStyle,
    props,
  }
}

describe('Inspector contextual field rendering by type', () => {
  it('header inspector schema has headerLevel and text fields', () => {
    const schema = getSchemaForType('header')
    const fieldKeys = schema.typeFields['header']?.map((f) => f.key) ?? []
    expect(fieldKeys).toContain('headerLevel')
    expect(fieldKeys).toContain('text')
  })

  it('text inspector schema has content and link fields', () => {
    const schema = getSchemaForType('text')
    const fieldKeys = schema.typeFields['text']?.map((f) => f.key) ?? []
    expect(fieldKeys).toContain('content')
    expect(fieldKeys).toContain('link')
  })

  it('columns inspector schema has columnCount and gap fields', () => {
    const schema = getSchemaForType('columns')
    const fieldKeys = schema.typeFields['columns']?.map((f) => f.key) ?? []
    expect(fieldKeys).toContain('columnCount')
    expect(fieldKeys).toContain('gap')
  })

  it('picture inspector schema has assetRef and alt fields', () => {
    const schema = getSchemaForType('picture')
    const fieldKeys = schema.typeFields['picture']?.map((f) => f.key) ?? []
    expect(fieldKeys).toContain('assetRef')
    expect(fieldKeys).toContain('alt')
  })

  it('all schemas include shared fields: name and visible', () => {
    for (const type of ['section', 'header', 'text', 'columns', 'picture'] as const) {
      const schema = getSchemaForType(type)
      const commonKeys = schema.commonFields.map((f) => f.key)
      expect(commonKeys).toContain('name')
      expect(commonKeys).toContain('visible')
    }
  })

  it('inspector schema can be retrieved by node type', () => {
    const headerNode = makeNode('header', { headerLevel: 'h1', text: 'Test' })
    const schema = getInspectorSchema(headerNode)
    expect(schema.key).toBe('header')
  })

  it('section inspector has section-specific fields', () => {
    const schema = getSchemaForType('section')
    const fieldKeys = schema.typeFields['section']?.map((f) => f.key) ?? []
    expect(fieldKeys.length).toBeGreaterThan(0)
  })

  it('different types return different type-specific fields', () => {
    const headerFields = getSchemaForType('header').typeFields['header']?.map((f) => f.key) ?? []
    const textFields = getSchemaForType('text').typeFields['text']?.map((f) => f.key) ?? []
    const overlap = headerFields.filter((k) => textFields.includes(k))
    expect(overlap).not.toContain('headerLevel')
    expect(overlap).not.toContain('content')
  })
})
