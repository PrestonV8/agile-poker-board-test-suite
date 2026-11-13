import {test,expect} from '@playwright/test'

test.describe('Login as admin', () => {
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
})