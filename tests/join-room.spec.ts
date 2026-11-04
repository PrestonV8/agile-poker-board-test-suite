import { test, expect} from '@playwright/test';

test.describe('Join Room (R2)', () => {

    const BASEURL = 'https://agilepokerboard.com/';

    let roomName: string;
    let roomCreated: boolean;
    
    // For each test, initiate a room as a test environment to test the join room functionality. 
    test.beforeEach(async ({page}, testInfo) => {
        roomCreated = false;
        roomName = `Join Room Test  ${testInfo.parallelIndex}-${Date.now()}`;
        const userName = "John Doe";
        
        await page.goto(BASEURL);
    
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
        
        roomCreated = true;
    });

    // After each test, close the room to not exceed the limit of total available rooms
    test.afterEach(async ({page}) => {
        if (roomCreated == false) 
        {
            return;
        }

        try 
        {
            await page.getByRole('button', {name: 'Room settings'}).click();
            await page.getByRole('button', {name: 'Close this room'}).click();
            await page.getByRole('button', {name: 'Close room'}).click();
        } catch (error) 
        {
            console.warn(`Cleanup failed. Room may still be open: "${roomName}"`, error);
        }
        

        await expect(page).toHaveURL(BASEURL);

        // verify the room is actually gone from the lobby
        await expect(page.locator('article.room-row').filter({hasText: roomName})).toHaveCount(0);
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
                .filter({ hasText: roomName });

            await expect(room).toHaveCount(1);

            // It's an <a>, so use role "link"
            await room.getByRole('link', { name: 'Join room' }).click();
            await expect(memberPage).toHaveURL(/\/r\/[a-z0-9]+/);

            // If a name prompt appears before entering, fill it here, e.g.:
            await memberPage.getByRole('button', { name: 'Reject optional' }).click();

            const nameInput = memberPage.getByLabel('Your display name');
            await nameInput.fill(memberName);
            await expect(nameInput).toHaveValue(memberName);

            await memberPage.getByRole('button', { name: 'Join room' }).click();
            await expect(memberPage.getByRole('heading', { name: 'Take a seat.' })).toBeHidden();
        } finally {
            await memberContext.close();
        }
    });

    test('Member can successfully join a room with special characters in names', async ({ browser }) => {
        const memberName = 'Kevin Kyle!@##$$%^&*()_+';

        // Separate context = separate session, like a different person
        const memberContext = await browser.newContext();
        const memberPage = await memberContext.newPage();

        try {
            await memberPage.goto(BASEURL);

            const room = memberPage
                .locator('article.room-row')
                .filter({ hasText: roomName });

            await expect(room).toHaveCount(1);

            // It's an <a>, so use role "link"
            await room.getByRole('link', { name: 'Join room' }).click();
            await expect(memberPage).toHaveURL(/\/r\/[a-z0-9]+/);

            // If a name prompt appears before entering, fill it here, e.g.:
            await memberPage.getByRole('button', { name: 'Reject optional' }).click();

            const nameInput = memberPage.getByLabel('Your display name');
            await nameInput.fill(memberName);
            await expect(nameInput).toHaveValue(memberName);

            await memberPage.getByRole('button', { name: 'Join room' }).click();
            await expect(memberPage.getByRole('heading', { name: 'Take a seat.' })).toBeHidden();
        } finally {
            await memberContext.close();
        }
    });

});
