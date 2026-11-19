import { test, expect, Page } from '@playwright/test';
import { createRoom, closeRoom } from './helpers/room';

const ROOM_NAME = 'Join Room Test Environment';
const SCRUM_MASTER = 'Preston Smith';
const MEMBER = 'Kevin Kyle';

test.describe('Join PIN (R18)', () => {
    test.describe.configure({ mode: 'serial'});

    let pin: string;
    let hostPage: Page;

    test.beforeAll(async ({ browser }) => {
        hostPage = await browser.newPage();
        await hostPage.goto('/'); // assumes baseURL is set in playwright.config.ts

        pin = await createRoom(hostPage, ROOM_NAME, SCRUM_MASTER);
    });

    test.afterAll( async () => {
        await closeRoom(hostPage);
        await hostPage.close();
    });

    test.describe(' as scrum master', () => {
    /**
     * Positive: Enter the correct PIN, click on the button
     * Expected result: Rooms opens and the heading shows the room name
     */

    /**
     * Positive: Enter the correct PIN, press the ENTER key
     * Expected result: Rooms opens and the heading shows the room name
     */

    /**
     * Negative: enter the wrong 2-digit PIN
     * Expected result: Error shown, stays on the PIN page
     */

    /**
     * Negative: Leave the PIN empty and submit
     * Expected result: Blocked, with a “required” message
     */

    /**
     * Negative: Enter only 1 digit
     * Expected result: Rejected, or an error if there’s a minimum length
     */

    /**
     * Negative: Enter 3 or more digits
     * Expected result: Input stops at 2 digits (check maxlength), or rejects the extra digits
     */

    /**
     * Negative: Wrong PIN several times in a row
     * Expected result: Check for a lockout or rate limit, and note what happens
     */
    });

    test.describe(' as member', () => {
    /**
     * Positive: Enter the correct PIN, click on the button
     * Expected result: Rooms opens and the heading shows the room name
     */
    });

    
});
