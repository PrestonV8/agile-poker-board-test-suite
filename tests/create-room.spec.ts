import {test, expect} from '@playwright/test';

test.describe('Create Room (R3)', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('https://agilepokerboard.com/');
    });

    test.afterEach(async ({ page }) => {
    const settings = page.getByRole('button', { name: 'Room settings' });
    if (await settings.isVisible()) {
        await settings.click();
        await page.getByRole('button', { name: 'Close this room' }).click();
        await page.getByRole('button', { name: 'Close room' }).click();
    }
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
    });

    test('Empty room name: the Create room button stays disabled', async ({page}) => {
        // expect result: alert message should appear instead of creating a room
        const userName = 'Preston Smith';

        await page.getByLabel('Your display name').fill(userName);

        const question = page.locator('.captcha-question');
        await expect(question).toContainText('=');

        const text = await question.innerText(); // "5 + 8 = ?"
        const [, a, b] = text.match(/(\d+)\s*\+\s*(\d+)/)!;

        await page.getByLabel('Captcha answer').fill(String(Number(a) + Number(b)));
        await expect(page.getByRole('button', { name: 'Create room' })).toBeEnabled();
        await page.getByRole('button', {name: 'Create room'}).click();

        await expect(page.locator('#room-name:invalid')).toHaveCount(1);
        await expect(page.getByLabel('Room name')).toHaveJSProperty(
            'validity.valueMissing', true
        );
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

        await expect(page).toHaveURL('https://agilepokerboard.com/');
    });

    test('Leading and trailing whitespace', async ({page}) => {
        // expected result: room is created successfully
        const roomName = '    Test Room 2    ';
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
        await expect(page.locator('.room-top').getByRole('heading', { name: roomName, exact: true })).toBeVisible();
        // or by level
        await expect(page.getByRole('heading', { level: 1, name: roomName, exact: true })).toBeVisible();
    });

    test('Room name with exactly 60 characters', async ({page}) => {
        // epected result: room is created successfully
        const roomName = 'a'.repeat(60);
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
        await expect(page.locator('.room-top').getByRole('heading', { name: roomName, exact: true })).toBeVisible();
        // or by level
        await expect(page.getByRole('heading', { level: 1, name: roomName, exact: true })).toBeVisible();
    });

    test('Room with more than 60 characters', async ({page}) => {
        const roomName = 'a'.repeat(61) + ' Test Room 3';
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
        await expect(page.locator('.room-top').getByRole('heading', { name: roomName, exact: true })).toBeVisible();
        // or by level
        await expect(page.getByRole('heading', { level: 1, name: roomName, exact: true })).toBeVisible();
    });

    test('User name is more than 30 characters', async ({page}) => {
        // expected result: room is created with a shortened user name (30 characters)
        const roomName = 'Test Room 4';
        const userName = '1234567890'.repeat(20); // should create a user name that is 200 characters long

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
        await expect(page.locator('.room-top').getByRole('heading', { name: roomName, exact: true })).toBeVisible();
        // or by level
        await expect(page.getByRole('heading', { level: 1, name: roomName, exact: true })).toBeVisible();

        // verify that the user name was shortened to 30 characters
        await expect(page.locator('.participant.is-you .player-name')).toHaveText('1234567890'.repeat(3));
    });

    test('Room name with 1 character', async ({page}) => {
        // expected result: room is created successfully
        const roomName = 't';
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
        await expect(page.locator('.room-top').getByRole('heading', { name: roomName, exact: true })).toBeVisible();
        // or by level
        await expect(page.getByRole('heading', { level: 1, name: roomName, exact: true })).toBeVisible();
    });
});