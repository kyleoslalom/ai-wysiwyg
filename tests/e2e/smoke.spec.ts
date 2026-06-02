import { expect, test } from '@playwright/test'

test('editor shell renders', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'ai-wysiwyg' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Export ZIP' })).toBeVisible()
})
