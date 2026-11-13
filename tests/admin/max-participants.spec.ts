import { test, expect, Page } from '@playwright/test';
import { unlockAdmin } from './helpers';

test.describe.configure({ mode: 'serial' });

test.describe('Admin: maximum participants per room', () => {
  let originalLimit: string;
  let needsRestore = false;

  const participantsInput = (page: Page) => page.getByLabel(/maximum participants/i);
  const saveButton = (page: Page) => page.getByRole('button', { name: 'Save participant limit' });

  /** Save a value, then load the admin page fresh and check the server stored it. */
  async function saveAndVerify(page: Page, value: string) {
    needsRestore = true;
    await participantsInput(page).fill(value);
    await saveButton(page).click();
    await page.waitForLoadState('networkidle');   // let the save finish before navigating away

    await expect(async () => {
      await unlockAdmin(page);
      await expect(participantsInput(page)).toHaveValue(value, { timeout: 1000 });
    }).toPass();
  }

  test.beforeEach(async ({ page }) => {
    needsRestore = false;
    await unlockAdmin(page);
    originalLimit = await participantsInput(page).inputValue();
  });

  test.afterEach(async ({ page }) => {
    if (!needsRestore) return;   // rejection tests never save, so nothing to put back

    await unlockAdmin(page);
    await participantsInput(page).fill(originalLimit);
    await saveButton(page).click();
    await page.waitForLoadState('networkidle');
  });

  // ---------- positive ----------

  test('accepts the minimum (2)', async ({ page }) => {
    await saveAndVerify(page, '2');
  });

  test('accepts the maximum (50)', async ({ page }) => {
    await saveAndVerify(page, '50');
  });

  test('persists a saved limit after reloading the admin page', async ({ page }) => {
    const newLimit = originalLimit === '10' ? '11' : '10';   // guaranteed different
    await saveAndVerify(page, newLimit);
  });

  // ---------- negative ----------

  const invalidValues = [
    { name: 'below the minimum (1)',  value: '1',  flag: 'rangeUnderflow' },
    { name: 'above the maximum (51)', value: '51', flag: 'rangeOverflow' },
    { name: 'empty',                  value: '',   flag: 'valueMissing' },
  ] as const;

  for (const { name, value, flag } of invalidValues) {
    test(`rejects ${name}`, async ({ page }) => {
      await participantsInput(page).fill(value);
      await saveButton(page).click();

      const isInvalid = await participantsInput(page).evaluate(
        (el: HTMLInputElement, f) => el.validity[f as keyof ValidityState], flag);
      expect(isInvalid).toBe(true);

      // Nothing was saved: load the admin page fresh and check the stored value
      await unlockAdmin(page);
      await expect(participantsInput(page)).toHaveValue(originalLimit);
    });
  }
});