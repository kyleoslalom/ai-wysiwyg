import { describe, expect, it } from 'vitest'
import { strFromU8, unzipSync } from 'fflate'
import type { Project } from '../../src/lib/domain/types'
import { exportProjectZip } from '../../src/lib/services/export/exporter'
import { isExportManifest } from '../../src/lib/domain/schemas/export-manifest'

function buildProject(): Project {
  const now = '2026-06-02T00:00:00.000Z'

  return {
    id: 'project-export',
    name: 'Export Project',
    createdAt: now,
    updatedAt: now,
    rootNodeId: 'root',
    version: 1,
    interactions: [],
    styles: {},
    nodes: {
      root: {
        id: 'root',
        type: 'container',
        parentId: null,
        children: ['heading-1'],
        content: {},
        classList: [],
      },
      'heading-1': {
        id: 'heading-1',
        type: 'heading',
        parentId: 'root',
        children: [],
        content: { text: 'Export Works' },
        classList: [],
      },
    },
  }
}

describe('static ZIP export loadability', () => {
  it('exports canonical static files that can be parsed by browser APIs', () => {
    const bytes = exportProjectZip(buildProject(), { generatedAt: '2026-06-02T12:00:00.000Z' })
    const zipFiles = unzipSync(bytes)

    expect(Object.keys(zipFiles).sort()).toEqual([
      'assets/app.js',
      'assets/styles.css',
      'index.html',
      'manifest.json',
    ])

    const html = strFromU8(zipFiles['index.html'])
    expect(html).toContain('assets/styles.css')
    expect(html).toContain('assets/app.js')

    const doc = new DOMParser().parseFromString(html, 'text/html')
    expect(doc.querySelector('h2')?.textContent).toBe('Export Works')

    const manifest = JSON.parse(strFromU8(zipFiles['manifest.json'])) as unknown
    expect(isExportManifest(manifest)).toBe(true)
  })
})
