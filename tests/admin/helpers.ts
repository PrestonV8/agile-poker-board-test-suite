import { Page, expect } from '@playwright/test';

export async function unlockAdmin(page: Page) {
  const password = 'G30ffagi1$';
  if (!password) throw new Error('Set the ADMIN_PASSWORD environment variable');

  // If the site answers "429 Too Many Requests", wait a little and try again
  let response = await page.goto('/admin');
  for (let attempt = 1; response?.status() === 429 && attempt <= 3; attempt++) {
    await page.waitForTimeout(5000 * attempt);   // 5s, 10s, 15s
    response = await page.goto('/admin');
  }

  await page.getByLabel('Admin password').fill(password);
  await page.getByRole('button', { name: 'Unlock administration' }).click();

  await expect(page.getByText('GLOBAL ADMINISTRATION')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Lock admin view' })).toBeVisible();
}