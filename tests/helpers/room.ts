import { Page, expect } from '@playwright/test'

export async function createRoom(page: Page, roomName: string, userName: string) {
        await page.getByRole('textbox', { name: 'Room name' }).click();
    await page.getByRole('textbox', { name: 'Room name' }).fill(roomName);
    await page.getByLabel('Your display name').fill(userName);

        const question = page.locator('.captcha-question');
        await expect(question).toContainText('=');

        const text = await question.innerText(); // "5 + 8 = ?"
        const [, a, b] = text.match(/(\d+)\s*\+\s*(\d+)/)!;

        await page.getByLabel('Captcha answer').fill(String(Number(a) + Number(b)));
        await expect(page.getByRole('button', { name: 'Create room' })).toBeEnabled();
        await page.getByRole('button', {name: 'Create room'}).click();

    // entering the PIN page
    await expect(page.getByTitle(/Enter your PIN./));
    const pin = page.locator('.pin-display strong');

    await expect(pin).toBeVisible();
    const pinValue = (await pin.textContent())?.trim() ?? '';

    await page.getByPlaceholder('2-digit PIN').fill(pinValue);
    await page.getByRole('button', {name: /enter room/i }).click();
}

export async function closeRoom(page: Page) {
    const settings = page.getByRole('button', { name: 'Room settings'});

    // wait for the room appear; if it still doesn't exist, then don't clean up
    try {
        await settings.waitFor({ state: 'visible', timeout: 3000})
    } catch {
        return;
    }

    await settings.click();
    await page.getByRole('button', {name: 'Close this room' }).click();
    await page.getByRole('button', {name: 'Close room'}).click();

    await expect(page).toHaveURL('https://agilepokerboard.com/');
}