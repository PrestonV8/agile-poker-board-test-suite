import { test, expect, Page } from '@playwright/test';
import { unlockAdmin } from './helpers';

// config.json is shared server state, so never run these in parallel
test.describe.configure({ mode: 'serial' });

test.describe('Admin: maximum active rooms', () => {
  let originalLimit: string;
  let needsRestore = false;   // only true when a test actually changed the server

  const roomsInput = (page: Page) => page.getByLabel(/maximum active rooms/i);
  const saveButton = (page: Page) => page.getByRole('button', { name: 'Save room limit' });
  const usageText = (page: Page) => page.getByText(/Currently \d+ of \d+ rooms in use/);

  /** Save a value, wait for the page to confirm it, then reload fresh and check it persisted. */
  async function saveAndVerify(page: Page, value: string) {
    needsRestore = true;
    await roomsInput(page).fill(value);
    await saveButton(page).click();
    await expect(usageText(page)).toHaveText(new RegExp(`of ${value} rooms`));

    await unlockAdmin(page);
    await expect(roomsInput(page)).toHaveValue(value);
  }

  test.beforeEach(async ({ page }) => {
    needsRestore = false;
    await unlockAdmin(page);
    originalLimit = await roomsInput(page).inputValue();
  });

  test.afterEach(async ({ page }) => {
    // Rejection tests never save, so there is nothing to put back
    if (!needsRestore) return;

    await unlockAdmin(page);
    await roomsInput(page).fill(originalLimit);
    await saveButton(page).click();
    await expect(usageText(page)).toHaveText(new RegExp(`of ${originalLimit} rooms`));
  });

  // ---------- positive ----------

  // TC-01
  test('shows the current saved limit', async ({ page }) => {
    await expect(roomsInput(page)).toHaveValue(/^\d+$/);
    await expect(usageText(page)).toHaveText(new RegExp(`of ${originalLimit} rooms`));
  });

  // TC-02, FS-R1, FS-R2
  test('saves a valid limit and shows it on admin and home pages', async ({ page }) => {
    needsRestore = true;
    const newLimit = originalLimit === '4' ? '5' : '4';   // guaranteed different

    await roomsInput(page).fill(newLimit);
    await saveButton(page).click();
    await expect(usageText(page)).toHaveText(new RegExp(`of ${newLimit} rooms`));

    await page.goto('/');
    await expect(page.getByText(/Rooms: \d+ of \d+ in use/))
      .toHaveText(new RegExp(`of ${newLimit}`));
  });

  // TC-03
  test('persists a saved limit after reloading the admin page', async ({ page }) => {
    const newLimit = originalLimit === '4' ? '5' : '4';
    await saveAndVerify(page, newLimit);
  });

  // TC-04 and TC-05
  for (const { name, value } of [
    { name: 'minimum', value: '1' },
    { name: 'maximum', value: '50' },
  ]) {
    test(`accepts the ${name} (${value})`, async ({ page }) => {
      await saveAndVerify(page, value);
    });
  }

  // ---------- negative ----------

  // TC-06 to TC-10, TC-16
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

  // TC-11
  test('rejects a decimal', async ({ page }) => {
    await roomsInput(page).fill('2.5');
    await saveButton(page).click();

    const invalid = await roomsInput(page).evaluate(
      (el: HTMLInputElement) => el.validity.stepMismatch);
    expect(invalid).toBe(true);
  });

  // TC-15
  test('rejects a very large number', async ({ page }) => {
    await roomsInput(page).fill('99999999');
    await saveButton(page).click();

    const invalid = await roomsInput(page).evaluate(
      (el: HTMLInputElement) => el.validity.rangeOverflow);
    expect(invalid).toBe(true);

    await unlockAdmin(page);
    await expect(roomsInput(page)).toHaveValue(originalLimit);
  });

  // TC-14
  test('ignores whitespace', async ({ page }) => {
    await roomsInput(page).clear();
    await roomsInput(page).pressSequentially('    ');
    await expect(roomsInput(page)).toHaveValue('');
  });

  // TC-12
  test('ignores letters', async ({ page }) => {
    await roomsInput(page).clear();
    await roomsInput(page).pressSequentially('qwertyuiopasdfghjklzxcvbnm');
    await expect(roomsInput(page)).toHaveValue('');
  });

  // TC-13
  test('ignores special characters', async ({ page }) => {
    await roomsInput(page).clear();
    await roomsInput(page).pressSequentially('q!@#$%^&*()');
    await expect(roomsInput(page)).toHaveValue('');
  });

  // ---------- regression ----------

  // TC-17
  test('does not change the other settings', async ({ page }) => {
    const others = [
      /maximum participants/i,
      /idle minutes/i,
      /maximum room lifetime/i,
      /inactivity timeout/i,
    ];

    const before: string[] = [];
    for (const label of others) before.push(await page.getByLabel(label).inputValue());

    const newLimit = originalLimit === '4' ? '5' : '4';
    await saveAndVerify(page, newLimit);   // ends on a fresh admin page

    for (let i = 0; i < others.length; i++) {
      await expect(page.getByLabel(others[i])).toHaveValue(before[i]);
    }
  });

  // TC-18
  test('saving the same value twice causes no problem', async ({ page }) => {
    const newLimit = originalLimit === '4' ? '5' : '4';
    await saveAndVerify(page, newLimit);
    await saveAndVerify(page, newLimit);
  });

  // ---------- UI ----------

  // TC-19
  test('shows the label, helper text and correct range', async ({ page }) => {
    await expect(roomsInput(page)).toBeVisible();
    await expect(page.getByText(/lowering the limit won't close existing rooms/i)).toBeVisible();
    await expect(roomsInput(page)).toHaveAttribute('min', '1');
    await expect(roomsInput(page)).toHaveAttribute('max', '50');
  });

  // TC-20
  test('submits with the Enter key', async ({ page }) => {
    needsRestore = true;
    const newLimit = originalLimit === '4' ? '5' : '4';
    await roomsInput(page).fill(newLimit);
    await roomsInput(page).press('Enter');
    await expect(usageText(page)).toHaveText(new RegExp(`of ${newLimit} rooms`));
  });
});