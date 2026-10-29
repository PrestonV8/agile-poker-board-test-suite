import { test, expect} from '@playwright/test';

test.describe('Navigation (R1)', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('https://agilepokerboard.com/');
    });

    test('home page loads with the main heading', async ({page}) => {
        // Perform the test here
        await expect(page).toHaveTitle(/agilepokerboard/i);
        await expect(page.getByRole('heading', {level: 1})).toBeVisible();
    });

    test('header Admin link goes to the admine page', async ({page}) => {
        await page.getByRole('link', { name: 'Admin'}).first().click();

        await expect(page).toHaveURL(/\/admin/);
    });

    test('logo link returns to the home page', async ({page}) => {
        await page.goto('https://agilepokerboard.com/admin');
        await page.getByRole('link', {name: /agilepokerboard/i }).first().click();
        await expect(page).toHaveURL('https://agilepokerboard.com/');
    });

    test('no menu link leads to an error page', async ({page}) => {
        const links = page.getByRole('link');
        const count = await links.count();

        for (let i = 0; i < count; i++) 
            {
                const href = await links.nth(i).getAttribute('href');

                if (!href || !href.startsWith('https://agilepokerboard.com/')) continue;

                const response = await page.request.get(href);
                expect(response.status(), `link ${href} should not be an error` ).toBeLessThan(400);
            }
    });
});