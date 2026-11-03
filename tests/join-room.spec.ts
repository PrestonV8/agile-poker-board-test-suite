import { test, expect} from '@playwright/test';

test.describe('Join Room (R2)', () => {

    const BASEURL = 'https://agilepokerboard.com/';
    const ROOMNAME = "Join Room Test Environment Room";
    
    // For each test, initiate a room as a test environment to test the join room functionality. 
    test.beforeEach(async ({page}) => {
        const userName = "John Doe";
        
        await page.goto(BASEURL);
    
        await page.getByLabel('Room Name').fill(ROOMNAME);
        await page.getByLabel('Your display name').fill(userName);

        const question = page.locator('.captcha-question');
        await expect(question).toContainText('=');

        const text = await question.innerText();
        const [, a, b] = text.match(/(\d+)\s*\+\s*(\d+)/)!;

        await page.getByLabel('Captcha answer').fill(String(Number(a) + Number(b)));
        await expect(page.getByRole('button', {name: 'Create room'})).toBeEnabled();

        await page.getByRole('button', {name: 'Create room'}).click();
        await expect(page.getByRole('heading', {name: ROOMNAME})).toBeVisible();
    });

    // After each test, close the room to not exceed the limit of total available rooms
    test.afterEach(async ({page}) => {
        await page.getByRole('button', {name: 'Room settings'}).click();
        await page.getByRole('button', {name: 'Close this room'}).click();
        await page.getByRole('button', {name: 'Close room'}).click();

        await expect(page).toHaveURL(BASEURL);

        // verify the room is actually gone from the lobby
        await expect(page.locator('article.room-row').filter({hasText: ROOMNAME})).toHaveCount(0);
    });

    test('Member can successfully join a room with valid names', async ({ browser }) => {
        const memberName = 'Kevin Kyle';

        // Separate context = separate session, like a different person
        const memberContext = await browser.newContext();
        const memberPage = await memberContext.newPage();

        try {
            await memberPage.goto(BASEURL);

            const room = memberPage
                .locator('article.room-row')
                .filter({ hasText: ROOMNAME });

            await expect(room).toHaveCount(1);

            // It's an <a>, so use role "link"
            await room.getByRole('link', { name: 'Join room' }).click();
            await expect(memberPage).toHaveURL(/\/r\/[a-z0-9]+/);

            // If a name prompt appears before entering, fill it here, e.g.:
            await memberPage.getByLabel('Your display name').fill(memberName);
            await memberPage.getByRole('button', { name: 'Join' }).click();

            await expect(memberPage.getByRole('heading', { name: ROOMNAME })).toBeVisible();
        } finally {
            await memberContext.close();
        }
    });
});
