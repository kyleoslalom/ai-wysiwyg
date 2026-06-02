import { describe, expect, it } from 'vitest'
import { exportProjectZip } from '../../src/lib/services/export/exporter'
import { createSampleProject } from '../../src/lib/domain/project/sample-project'

describe('deterministic export regression', () => {
  it('creates identical ZIP output for unchanged project state', () => {
    const project = createSampleProject()
    const generatedAt = '2026-06-02T12:00:00.000Z'

    const first = exportProjectZip(project, { generatedAt })
    const second = exportProjectZip(project, { generatedAt })

    expect(Array.from(first)).toEqual(Array.from(second))
  })
})
