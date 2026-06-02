import { describe, expect, it } from 'vitest'
import { buildExportArtifact } from '../../src/lib/services/export/exporter'
import { createSampleProject } from '../../src/lib/domain/project/sample-project'

describe('static-host portability contract', () => {
  it('uses relative static assets and no build-time runtime requirements', () => {
    const artifact = buildExportArtifact(createSampleProject(), {
      generatedAt: '2026-06-02T12:00:00.000Z',
    })

    expect(artifact.html).toContain('<link rel="stylesheet" href="assets/styles.css" />')
    expect(artifact.html).toContain('<script src="assets/app.js"></script>')
    expect(artifact.html).not.toContain('http://')
    expect(artifact.html).not.toContain('https://')
    expect(artifact.js).not.toContain('import ')
  })
})
