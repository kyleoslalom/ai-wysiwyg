import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

export const PARITY_VISUAL_THRESHOLD = 0.01

export interface ParityAssertOptions {
  visualThreshold?: number
  snapshotName?: string
}

/**
 * Assert that the DOM structure of two HTML strings have the same node types at each level.
 * Uses basic tag name comparison (not attribute equality) for structural parity.
 */
export function assertDomStructureEquality(
  canvasHtml: string,
  exportHtml: string,
  context?: string,
): void {
  const canvasTags = extractTagNames(canvasHtml)
  const exportTags = extractTagNames(exportHtml)

  if (canvasTags.join(',') !== exportTags.join(',')) {
    throw new Error(
      `DOM structure parity failure${context ? ` in ${context}` : ''}: ` +
        `canvas tags [${canvasTags.join(', ')}] !== export tags [${exportTags.join(', ')}]`,
    )
  }
}

function extractTagNames(html: string): string[] {
  const matches = html.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g) ?? []
  return matches.map((m) => m.match(/^<([a-zA-Z][a-zA-Z0-9]*)/)?.[1]?.toLowerCase() ?? '')
    .filter(Boolean)
}

/**
 * Assert visual parity using Playwright screenshot comparison.
 * Expects pixelmatch-compatible threshold (0-1, where 0.01 = <=1% diff).
 */
export async function assertVisualParity(
  page: Page,
  selector: string,
  snapshotName: string,
  options?: { threshold?: number },
): Promise<void> {
  const element = page.locator(selector)
  await expect(element).toBeVisible()
  await expect(element).toHaveScreenshot(`${snapshotName}.png`, {
    maxDiffPixelRatio: options?.threshold ?? PARITY_VISUAL_THRESHOLD,
  })
}

/**
 * Check DOM structure parity between canvas and a rendered export tree.
 * Returns comparison result without throwing.
 */
export function checkDomParity(
  canvasHtml: string,
  exportHtml: string,
): { match: boolean; canvasTags: string[]; exportTags: string[] } {
  const canvasTags = extractTagNames(canvasHtml)
  const exportTags = extractTagNames(exportHtml)
  return {
    match: canvasTags.join(',') === exportTags.join(','),
    canvasTags,
    exportTags,
  }
}
