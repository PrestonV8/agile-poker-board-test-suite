import { Page, expect } from '@playwright/test'

export async function createRoom(page: Page, roomName: string, userName: string) {
    await page.getByLabel('Room name').fill(roomName);
    await page.getByLabel('Your display name').fill(userName);

    const question = await page.locator('captcha-question');
    await expect(question).toContainText('=');

    const text = await question.innerText();
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

    // verify that the room was created successfully by checking for the room name in the heading
    await expect(page.getByRole('heading', { name: roomName })).toBeVisible();
}