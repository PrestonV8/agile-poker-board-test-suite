import { test, expect } from '@playwright/test';

test.describe('Admin (R13', () => {
    const BASEURL = 'https://agilepokerboard.com/';
    const ADMIN_PASSWORD = 'G30ffagi1$';

    test.beforeEach(async ({page}) => {
        await page.goto(BASEURL);
        await page.getByRole('link', { name: 'Admin'}).first().click();

        await expect(page).toHaveURL(/\/admin/);
    });

    test('Admin logs in with correct password', async ({page}) => {
        await page.getByLabel('Admin password').fill(ADMIN_PASSWORD);
        await page.getByRole('button', {name: 'Unlock administration'}).click();

        await expect(page.getByText('GLOBAL ADMINISTRATION')).toBeVisible();
        await expect(page.getByRole('button', {name: 'Lock admin view'})).toBeVisible();
    });
});