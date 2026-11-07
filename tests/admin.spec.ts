import { test, expect } from '@playwright/test';

test.describe('Admin (R13)', () => {
    const BASE_URL = 'https://agilepokerboard.com/';
    const ADMIN_URL = 'https://agilepokerboard.com/admin';
    const ADMIN_PASSWORD = 'G30ffagi1$';

    test.beforeEach(async ({page}) => {
        await page.goto(ADMIN_URL);

        await expect(page).toHaveURL(/\/admin/);
    });

    test('Admin logs in with correct password', async ({page}) => {
        await page.getByLabel('Admin password').fill(ADMIN_PASSWORD);
        await page.getByRole('button', {name: 'Unlock administration'}).click();

        await expect(page.getByText('GLOBAL ADMINISTRATION')).toBeVisible();
        await expect(page.getByRole('button', {name: 'Lock admin view'})).toBeVisible();
    });
    
    test('Admin fails to log in with incorrect password', async ({page}) => {
        const incorrectPassword = 'wrongpassword';
        await page.getByLabel('Admin password').fill(incorrectPassword);
        await page.getByRole('button', {name: 'Unlock administration'}).click();

        await expect(page.getByRole('alert')).toBeVisible();
        await expect(page.getByRole('alert')).toHaveText('Incorrect admin password.');
    });

    test('Admin sets room limit to valid number', async ({page}) => {
        const roomLimit = '3';
        
        await page.getByLabel('Admin password').fill(ADMIN_PASSWORD);
        await page.getByRole('button', {name: 'Unlock administration'}).click();

        await expect(page.getByText('GLOBAL ADMINISTRATION')).toBeVisible();
        await expect(page.getByRole('button', {name: 'Lock admin view'})).toBeVisible();

        await page.getByLabel(/maximum active rooms/i).fill(roomLimit);
        await page.getByRole('button', {name: 'Save room limit'}).click();

        let usage = page.getByText(/Currently \d+ of \d+ rooms in use./);
        await expect(usage).toHaveText(/of 3 rooms/);

        await page.goto(BASE_URL);
        usage = page.getByText(/Rooms: \d+ of \d+ in use./);
        await expect(usage).toHaveText(/of 3/);
        // test passed, so let's put it back to how it was before

        await page.goto(ADMIN_URL);
        await page.getByLabel('Admin password').fill(ADMIN_PASSWORD);
        await page.getByRole('button', {name: 'Unlock administration'}).click();

        await expect(page.getByText('GLOBAL ADMINISTRATION')).toBeVisible();
        await expect(page.getByRole('button', {name: 'Lock admin view'})).toBeVisible();

        await page.getByLabel(/maximum active rooms/i).fill(roomLimit);
        await page.getByRole('button', {name: 'Save room limit'}).click();

        usage = page.getByText(/Currently \d+ of \d+ rooms in use./);
        await expect(usage).toHaveText(/of 3 rooms/);
    });

    // test for too many rooms beyond limit
    test('Setting too many rooms beyond the limit', async ({page}) => {
        const roomLimit = '51';

        await page.getByLabel('Admin password').fill(ADMIN_PASSWORD);
        await page.getByRole('button', {name: 'Unlock administration'}).click();

        await expect(page.getByText('GLOBAL ADMINISTRATION')).toBeVisible();
        await expect(page.getByRole('button', {name: 'Lock admin view'})).toBeVisible();

        const limit = await page.getByLabel(/maximum active rooms/i)
        limit.fill(roomLimit);
        await page.getByRole('button', {name: 'Save room limit'}).click();

        await expect(limit).toHaveJSProperty('validity.rangeOverflow', true);
        await expect(page.getByText(/Currently \d+ of 2 rooms in use/)).toBeVisible();
    });

    // test for invalid value (negative number)

    // test for invalid value (letters)

    // test for invalid value (special characters)
});