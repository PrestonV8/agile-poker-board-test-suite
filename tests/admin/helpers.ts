import { Page, expect } from '@playwright/test';

export async function unlockAdmin(page: Page) {
  const password = 'G30ffagi1$';
  if (!password) throw new Error('Set the ADMIN_PASSWORD environment variable');

  await page.goto('/admin');
  await page.getByLabel('Admin password').fill(password);
  await page.getByRole('button', { name: 'Unlock administration' }).click();
  await expect(page.getByText('GLOBAL ADMINISTRATION')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Lock admin view' })).toBeVisible();
}