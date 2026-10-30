import { test, expect } from "@playwright/test";

test.describe("Theme (R)", () => {
    test.beforeEach(async ({page}) => {
        await page.goto('https://agilepokerboard.com/');
    });

    test("default theme is light", async ({page}) => {
        const lightThemeButton = page.getByRole('button', {name: 'light theme'});

        await expect(lightThemeButton).toHaveAttribute('aria-pressed', 'true');
    });

    test("switching to dark theme works", async ({page}) => {
        const darkThemeButton = page.getByRole('button', {name: 'dark theme'});

        await expect(darkThemeButton).toHaveAttribute('aria-pressed', 'false');

        await darkThemeButton.click();
        await expect(darkThemeButton).toHaveAttribute('aria-pressed', 'true');
    });

    test("switching back to light theme works", async ({page}) => {
        const lightThemeButton = page.getByRole('button', {name:'light theme'});

        await expect(lightThemeButton).toHaveAttribute('aria-pressed', 'true');

        await page.getByRole('button', {name: 'dark theme'}).click();
        await expect(lightThemeButton).toHaveAttribute('aria-pressed', 'false');

        await lightThemeButton.click();
        await expect(lightThemeButton).toHaveAttribute('aria-pressed', 'true');
    });
});