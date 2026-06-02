import { describe, expect, it } from 'vitest'
import type { Project } from '../../src/lib/domain/types'
import { isExportManifest } from '../../src/lib/domain/schemas/export-manifest'
import { buildExportArtifact } from '../../src/lib/services/export/exporter'

function buildProject(): Project {
  const now = '2026-06-02T00:00:00.000Z'

  return {
    id: 'project-contract',
    name: 'Contract Project',
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
        children: ['text-1'],
        content: {},
        classList: [],
      },
      'text-1': {
        id: 'text-1',
        type: 'text',
        parentId: 'root',
        children: [],
        content: { text: 'Hello' },
        classList: [],
      },
    },
  }
}

describe('export manifest contract', () => {
  it('produces canonical deterministic manifest entries', () => {
    const project = buildProject()
    const generatedAt = '2026-06-02T12:00:00.000Z'

    const artifactA = buildExportArtifact(project, { generatedAt })
    const artifactB = buildExportArtifact(project, { generatedAt })

    expect(isExportManifest(artifactA.manifest)).toBe(true)
    expect(artifactA.manifest.entries).toEqual([
      { path: 'index.html', type: 'text/html' },
      { path: 'assets/styles.css', type: 'text/css' },
      { path: 'assets/app.js', type: 'text/javascript' },
      { path: 'manifest.json', type: 'application/json' },
    ])
    expect(artifactA.manifest).toEqual(artifactB.manifest)
  })
})
