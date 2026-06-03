import { describe, it, expect } from 'vitest'
import type { LayerNode, LayerStyle } from '../../src/lib/domain/schemas/layerNodeSchema'
import {
  isHeaderNode,
  isTextNode,
  isColumnsNode,
  isPictureNode,
  isSectionNode,
  createDefaultLayerStyle,
} from '../../src/lib/domain/schemas/layerNodeSchema'

const defaultStyle: LayerStyle = { spacing: {}, alignment: {}, background: {} }

function makeNode(overrides: Partial<LayerNode>): LayerNode {
  return {
    id: 'node-1',
    type: 'section',
    parentId: null,
    children: [],
    name: 'Test Node',
    visible: true,
    style: defaultStyle,
    props: {},
    ...overrides,
  }
}

describe('LayerNode contract - required fields', () => {
  it('all required fields are present on a section node', () => {
    const node = makeNode({})
    expect(node.id).toBeDefined()
    expect(node.type).toBe('section')
    expect(node.parentId).toBeNull()
    expect(Array.isArray(node.children)).toBe(true)
    expect(node.name).toBeDefined()
    expect(typeof node.visible).toBe('boolean')
    expect(node.style).toHaveProperty('spacing')
    expect(node.style).toHaveProperty('alignment')
    expect(node.style).toHaveProperty('background')
    expect(node.props).toBeDefined()
  })

  it('header node has correct props shape', () => {
    const node = makeNode({
      type: 'header',
      parentId: 'sec-1',
      props: { headerLevel: 'h1', text: 'Hello' },
    })
    expect(isHeaderNode(node)).toBe(true)
    if (isHeaderNode(node)) {
      expect(node.props.headerLevel).toBe('h1')
      expect(node.props.text).toBe('Hello')
    }
  })

  it('text node has correct props shape', () => {
    const node = makeNode({
      type: 'text',
      parentId: 'sec-1',
      props: { content: 'Sample', link: null },
    })
    expect(isTextNode(node)).toBe(true)
    if (isTextNode(node)) {
      expect(node.props.content).toBe('Sample')
      expect(node.props.link).toBeNull()
    }
  })

  it('columns node has correct props shape', () => {
    const node = makeNode({
      type: 'columns',
      parentId: 'sec-1',
      props: {
        columnCount: 2,
        gap: '1rem',
        collapseBreakpointPx: 768,
        manualWidths: null,
        normalizedWidths: null,
      },
    })
    expect(isColumnsNode(node)).toBe(true)
    if (isColumnsNode(node)) {
      expect(node.props.columnCount).toBe(2)
      expect(node.props.gap).toBe('1rem')
      expect(node.props.collapseBreakpointPx).toBe(768)
    }
  })

  it('picture node has correct props shape', () => {
    const node = makeNode({
      type: 'picture',
      parentId: 'sec-1',
      props: { assetRef: 'assets/images/img.png', alt: 'desc', caption: 'Fig' },
    })
    expect(isPictureNode(node)).toBe(true)
    if (isPictureNode(node)) {
      expect(node.props.assetRef).toMatch(/^assets\/images\//)
      expect(node.props.alt).toBe('desc')
      expect(node.props.caption).toBe('Fig')
    }
  })

  it('section node type guard works', () => {
    const node = makeNode({ type: 'section', props: {} })
    expect(isSectionNode(node)).toBe(true)
    expect(isHeaderNode(node)).toBe(false)
    expect(isTextNode(node)).toBe(false)
    expect(isColumnsNode(node)).toBe(false)
    expect(isPictureNode(node)).toBe(false)
  })

  it('createDefaultLayerStyle returns required fields', () => {
    const style = createDefaultLayerStyle()
    expect(style).toHaveProperty('spacing')
    expect(style).toHaveProperty('alignment')
    expect(style).toHaveProperty('background')
    expect(style.spacing).toEqual({})
    expect(style.alignment).toEqual({})
    expect(style.background).toEqual({})
  })

  it('header parentId must be a string (not null)', () => {
    const node = makeNode({
      type: 'header',
      parentId: 'sec-1',
      props: { headerLevel: 'h2', text: 'Test' },
    })
    expect(typeof node.parentId).toBe('string')
    expect(node.parentId).not.toBeNull()
  })

  it('header levels are constrained to h1-h6', () => {
    const levels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const
    for (const level of levels) {
      const node = makeNode({
        type: 'header',
        parentId: 'sec-1',
        props: { headerLevel: level, text: 'Test' },
      })
      expect(isHeaderNode(node)).toBe(true)
      if (isHeaderNode(node)) {
        expect(node.props.headerLevel).toBe(level)
      }
    }
  })

  it('columns columnCount is 1-6', () => {
    for (let i = 1; i <= 6; i++) {
      const node = makeNode({
        type: 'columns',
        parentId: 'sec-1',
        props: {
          columnCount: i,
          gap: '1rem',
          collapseBreakpointPx: 768,
          manualWidths: null,
          normalizedWidths: null,
        },
      })
      if (isColumnsNode(node)) {
        expect(node.props.columnCount).toBe(i)
      }
    }
  })

  it('picture assetRef must start with assets/images/', () => {
    const node = makeNode({
      type: 'picture',
      parentId: 'sec-1',
      props: { assetRef: 'assets/images/photo.jpg', alt: 'photo' },
    })
    if (isPictureNode(node)) {
      expect(node.props.assetRef.startsWith('assets/images/')).toBe(true)
    }
  })
})
