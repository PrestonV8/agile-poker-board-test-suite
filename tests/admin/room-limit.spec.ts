import { test, expect, Page } from '@playwright/test';
import { unlockAdmin } from './helpers';

test.describe.configure({ mode: 'serial' });

test.describe('Admin: maximum active rooms', () => {
  let originalLimit: string;

  const roomsInput = (page: Page) => page.getByLabel(/maximum active rooms/i);
  const saveButton = (page: Page) => page.getByRole('button', { name: 'Save room limit' });

  test.beforeEach(async ({ page }) => {
    await unlockAdmin(page);
    originalLimit = await roomsInput(page).inputValue();
  });

  test.afterEach(async ({ page }) => {
    // Always restore, even if the test failed midway
    await unlockAdmin(page);
    await roomsInput(page).fill(originalLimit);
    await saveButton(page).click();
    await expect(page.getByText(/Currently \d+ of \d+ rooms in use/))
      .toHaveText(new RegExp(`of ${originalLimit} rooms`));
  });

  test('saves a valid limit and shows it on admin and home pages', async ({ page }) => {
    const newLimit = originalLimit === '4' ? '5' : '4';   // guaranteed different

    await roomsInput(page).fill(newLimit);
    await saveButton(page).click();
    await expect(page.getByText(/Currently \d+ of \d+ rooms in use/))
      .toHaveText(new RegExp(`of ${newLimit} rooms`));

    await page.goto('/');
    await expect(page.getByText(/Rooms: \d+ of \d+ in use/))
      .toHaveText(new RegExp(`of ${newLimit}`));
  });

  const invalidValues = [
    { name: 'above the maximum (51)', value: '51', flag: 'rangeOverflow' },
    { name: 'zero',                   value: '0',  flag: 'rangeUnderflow' },
    { name: 'negative number',        value: '-1', flag: 'rangeUnderflow' },
    { name: 'empty',                  value: '',   flag: 'valueMissing' },
  ] as const;

  for (const { name, value, flag } of invalidValues) {
    test(`rejects ${name}`, async ({ page }) => {
      await roomsInput(page).fill(value);
      await saveButton(page).click();

      const isInvalid = await roomsInput(page).evaluate(
        (el: HTMLInputElement, f) => el.validity[f as keyof ValidityState], flag);
      expect(isInvalid).toBe(true);

      // Nothing was saved: load the admin page fresh and check the stored value
      await unlockAdmin(page);
      await expect(roomsInput(page)).toHaveValue(originalLimit);
    });
  }

  test('ignores whitespace', async ({ page }) => {
    await roomsInput(page).clear();
    await roomsInput(page).pressSequentially('    ');
    await expect(roomsInput(page)).toHaveValue('');
  });

  test('ignores letters', async ({ page }) => {
    await roomsInput(page).clear();
    await roomsInput(page).pressSequentially('qwertyuiopasdfghjklzxcvbnm');
    await expect(roomsInput(page)).toHaveValue('');
  });

  test('ignores special characters', async ({ page }) => {
    await roomsInput(page).clear();
    await roomsInput(page).pressSequentially('q!@#$%^&*()');
    await expect(roomsInput(page)).toHaveValue('');
  });
});