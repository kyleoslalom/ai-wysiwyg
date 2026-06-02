interface ManifestEntry {
  path: string
  type: string
}

interface ExportManifest {
  formatVersion: string
  projectId: string
  generatedAt: string
  entries: ManifestEntry[]
  hashes?: Record<string, string>
}

const CANONICAL_ENTRIES: ManifestEntry[] = [
  { path: 'index.html', type: 'text/html' },
  { path: 'assets/styles.css', type: 'text/css' },
  { path: 'assets/app.js', type: 'text/javascript' },
  { path: 'manifest.json', type: 'application/json' },
]

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

export function isExportManifest(value: unknown): value is ExportManifest {
  if (!value || typeof value !== 'object') return false

  const v = value as Record<string, unknown>

  if (
    typeof v.formatVersion !== 'string' ||
    typeof v.projectId !== 'string' ||
    !isIsoDate(v.generatedAt) ||
    !Array.isArray(v.entries) ||
    v.entries.length !== CANONICAL_ENTRIES.length
  ) {
    return false
  }

  for (let i = 0; i < CANONICAL_ENTRIES.length; i += 1) {
    const expected = CANONICAL_ENTRIES[i]
    const got = v.entries[i] as Record<string, unknown>
    if (!got || got.path !== expected.path || got.type !== expected.type) {
      return false
    }
  }

  if (v.hashes !== undefined) {
    if (typeof v.hashes !== 'object' || v.hashes === null) return false
    for (const hash of Object.values(v.hashes as Record<string, unknown>)) {
      if (typeof hash !== 'string') return false
    }
  }

  return true
}
