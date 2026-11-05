import {test, expect} from '@playwright/test';

test.describe('Create Room (R3)', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('https://agilepokerboard.com/');
    });

    test('Successfully create a room with valid names', async ({page}) => {
        const roomName = 'Test Room 1';
        const userName = 'Preston Smith';
        
        await page.getByLabel('Room Name').fill(roomName);
        await page.getByLabel('Your display name').fill(userName);

        const question = page.locator('.captcha-question');
        await expect(question).toContainText('=');

        const text = await question.innerText(); // "5 + 8 = ?"
        const [, a, b] = text.match(/(\d+)\s*\+\s*(\d+)/)!;

        await page.getByLabel('Captcha answer').fill(String(Number(a) + Number(b)));
        await expect(page.getByRole('button', { name: 'Create room' })).toBeEnabled();

        await page.getByRole('button', {name: 'Create room'}).click();

        // verify that the room was created successfully by checking for the room name in the heading
        await expect(page.getByRole('heading', { name: roomName })).toBeVisible();

        // will need to close the room to not exceed the limit of total available rooms on site
        await page.getByRole('button', {name: 'Room settings'}).click();
        await page.getByRole('button', {name: 'Close this room' }).click();
        await page.getByRole('button', {name: 'Close room'}).click();

        await expect(page).toHaveURL('https://agilepokerboard.com/');
    });

    test('Create a room with digits only in the room name', async ({page}) => {
        const roomName = '1234567890';
        const userName = 'Preston Smith';

        await page.getByLabel('Room Name').fill(roomName);
        await page.getByLabel('Your display name').fill(userName);

        const question = page.locator('.captcha-question');
        await expect(question).toContainText('=');

        const text = await question.innerText(); // "5 + 8 = ?"
        const [, a, b] = text.match(/(\d+)\s*\+\s*(\d+)/)!;

        await page.getByLabel('Captcha answer').fill(String(Number(a) + Number(b)));
        await expect(page.getByRole('button', { name: 'Create room' })).toBeEnabled();

        await page.getByRole('button', {name: 'Create room'}).click();

        // verify that the room was created successfully by checking for the room name in the heading
        await expect(page.getByRole('heading', { name: roomName })).toBeVisible();

        // will need to close the room to not exceed the limit of total available rooms on site
        await page.getByRole('button', {name: 'Room settings'}).click();
        await page.getByRole('button', {name: 'Close this room' }).click();
        await page.getByRole('button', {name: 'Close room'}).click();

        await expect(page).toHaveURL('https://agilepokerboard.com/');
    });

    test('Create a room with only special characters', async ({page}) => {
        const roomName = '!@#$%^&*()_+';
        const userName = 'Preston Smith';

        await page.getByLabel('Room Name').fill(roomName);
        await page.getByLabel('Your display name').fill(userName);

        const question = page.locator('.captcha-question');
        await expect(question).toContainText('=');

        const text = await question.innerText(); // "5 + 8 = ?"
        const [, a, b] = text.match(/(\d+)\s*\+\s*(\d+)/)!;

        await page.getByLabel('Captcha answer').fill(String(Number(a) + Number(b)));
        await expect(page.getByRole('button', { name: 'Create room' })).toBeEnabled();

        await page.getByRole('button', {name: 'Create room'}).click();

        // verify that the room was created successfully by checking for the room name in the heading
        await expect(page.getByRole('heading', { name: roomName })).toBeVisible();

        // will need to close the room to not exceed the limit of total available rooms on site
        await page.getByRole('button', {name: 'Room settings'}).click();
        await page.getByRole('button', {name: 'Close this room' }).click();
        await page.getByRole('button', {name: 'Close room'}).click();

        await expect(page).toHaveURL('https://agilepokerboard.com/');
    });

    test('Whitespace-only room name', async ({page}) => {
        // expected result: error message is playerd "Please use 1-60 characters"
        const roomName = '    ';
        const userName = 'Preston Smith';

        await page.getByLabel('Room Name').fill(roomName);
        await page.getByLabel('Your display name').fill(userName);

        const question = page.locator('.captcha-question');
        await expect(question).toContainText('=');

        const text = await question.innerText(); // "5 + 8 = ?"
        const [, a, b] = text.match(/(\d+)\s*\+\s*(\d+)/)!;

        await page.getByLabel('Captcha answer').fill(String(Number(a) + Number(b)));
        await expect(page.getByRole('button', { name: 'Create room' })).toBeEnabled();

        await page.getByRole('button', {name: 'Create room'}).click();

        // check if the warning message apears on the page
        await expect(page.getByRole('alert')).toBeVisible();
        await expect(page.getByRole('alert')).toHaveText('Please use 1–60 characters.');
    });

});