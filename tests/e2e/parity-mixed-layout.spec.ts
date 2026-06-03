import { test, expect } from '@playwright/test'
import fixtureProject from './fixtures/mixed-layout.project.json'
import { checkDomParity } from './utils/parityAssert'
import { buildRenderModel } from '../../src/lib/services/editor/renderModel'
import type { RichProject } from '../../src/lib/domain/schemas/projectSchema'

const project = fixtureProject as unknown as RichProject

test.describe('Parity fixture: mixed layout', () => {
  test('render model builds from mixed-layout fixture', () => {
    const model = buildRenderModel(project)
    expect(model.projectId).toBe(project.id)
    expect(model.tree.type).toBe('section')

    // Root should have one section child
    const sections = model.tree.children
    expect(sections.length).toBeGreaterThan(0)

    // The section should have header, text, columns, picture children
    const mainSection = sections[0]!
    const types = mainSection.children.map((c) => c.type)
    expect(types).toContain('header')
    expect(types).toContain('text')
    expect(types).toContain('columns')
    expect(types).toContain('picture')
  })

  test('header render props are correctly extracted', () => {
    const model = buildRenderModel(project)
    const section = model.tree.children[0]!
    const header = section.children.find((c) => c.type === 'header')
    expect(header).toBeDefined()
    const props = header!.props as { level: string; text: string }
    expect(props.level).toBe('h1')
    expect(props.text).toBeTruthy()
  })

  test('columns render props include widths', () => {
    const model = buildRenderModel(project)
    const section = model.tree.children[0]!
    const cols = section.children.find((c) => c.type === 'columns')
    expect(cols).toBeDefined()
    const props = cols!.props as { columnCount: number; widths: number[] }
    expect(props.columnCount).toBe(2)
    expect(props.widths).toHaveLength(2)
    const sum = props.widths.reduce((a, b) => a + b, 0)
    expect(Math.abs(sum - 100)).toBeLessThan(0.01)
  })

  test('picture render props include src and alt', () => {
    const model = buildRenderModel(project)
    const section = model.tree.children[0]!
    const pic = section.children.find((c) => c.type === 'picture')
    expect(pic).toBeDefined()
    const props = pic!.props as { src: string; alt: string }
    expect(props.alt).toBeTruthy()
    // src will be a data: URL since the fixture has embedded bytes
    expect(props.src).toBeTruthy()
  })

  test('DOM structure parity check utility works', () => {
    const canvas = '<section><h1>Title</h1><p>Text</p></section>'
    const exportHtml = '<section><h1>Title</h1><p>Text</p></section>'
    const result = checkDomParity(canvas, exportHtml)
    expect(result.match).toBe(true)
  })

  test('DOM structure parity detects mismatch', () => {
    const canvas = '<section><h1>Title</h1><p>Text</p></section>'
    const exportHtml = '<section><h2>Title</h2><p>Text</p></section>'
    const result = checkDomParity(canvas, exportHtml)
    expect(result.match).toBe(false)
  })
})
