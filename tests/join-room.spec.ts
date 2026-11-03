import { test, expect} from '@playwright/test';

test.describe('Join Room (R2)', () => {
    
    // For each test, initiate a room as a test environment to test the join room functionality. 
    test.beforeEach(async ({page}) => {
        const roomName = "Join Room Test Environment";
        const userName = "John Doe";
        
        await page.goto('https://agilepokerboard.com/');
    
        await page.getByLabel('Room Name').fill(roomName);
        await page.getByLabel('Your display name').fill(userName);

        const question = page.locator('.captcha-question');
        await expect(question).toContainText('=');

        const text = await question.innerText();
        const [, a, b] = text.match(/(\d+)\s*\+\s*(\d+)/)!;

        await page.getByLabel('Captcha answer').fill(String(Number(a) + Number(b)));
        await expect(page.getByRole('button', {name: 'Create room'})).toBeEnabled();

        await page.getByRole('button', {name: 'Create room'}).click();
        await expect(page.getByRole('heading', {name: roomName})).toBeVisible();
    });

    // After each test, close the room to not exceed the limit of total available rooms
    test.afterEach(async ({page}) => {
        await page.getByRole('button', {name: 'Room settings'}).click();
        await page.getByRole('button', {name: 'Close this room'}).click();
        await page.getByRole('button', {name: 'Close room'}).click();

        await expect(page).toHaveURL('https://agilepokerboard.com/');
    });
});
