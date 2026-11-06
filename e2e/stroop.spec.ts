import { expect, test, type Page } from '@playwright/test';
import { mockSupabase, SQUAD_CODE } from './supabase-mock';

const KEY = 'tempra.test.vibrations';

// Ink colour of the stimulus (computed style) to the Italian name each answer button carries.
const INK_NAME: Record<string, string> = {
	'rgb(255, 90, 90)': 'Rosso',
	'rgb(79, 211, 138)': 'Verde',
	'rgb(111, 168, 255)': 'Blu',
	'rgb(255, 200, 87)': 'Giallo'
};

const vibrations = (page: Page) =>
	page.evaluate((key) => JSON.parse(sessionStorage.getItem(key) ?? '[]'), KEY);

const inkName = async (page: Page) => {
	const rgb = await page.locator('.stim').evaluate((el) => getComputedStyle(el).color);

	return INK_NAME[rgb];
};

// The haptics tell a correct trial (15) from a wrong one (40), so they expose the score per tap.
test('tapping the ink colour counts as correct, any other colour as wrong', async ({ page }) => {
	await page.addInitScript((key) => {
		navigator.vibrate = (pattern) => {
			const calls = JSON.parse(sessionStorage.getItem(key) ?? '[]');
			sessionStorage.setItem(key, JSON.stringify([...calls, pattern]));

			return true;
		};
	}, KEY);

	const state = await mockSupabase(page);
	state.config = {
		...state.config,
		block_duration_s: 60,
		game_duration_s: 20,
		games: ['stroop'],
		time_pressure: false
	};

	await page.goto(`/athlete?code=${SQUAD_CODE}`);
	await page.fill('#join-name', 'Marco');
	await page.getByTestId('join-submit').click();
	await expect(page.getByTestId('athlete-home')).toBeVisible();
	await page.getByTestId('start-block').click();

	// The intro card between games also uses `.stim`: wait for the answer buttons instead.
	await expect(page.locator('.answers .btn').first()).toBeVisible({ timeout: 10_000 });

	const ink = await inkName(page);
	expect(ink).toBeDefined();
	await page.locator(`.answers .btn[aria-label="${ink}"]`).click();
	await expect.poll(() => vibrations(page)).toEqual([15]);

	// Wait out the pause between trials, then answer the next one wrong on purpose.
	await page.waitForTimeout(500);
	const next = await inkName(page);
	await page.locator(`.answers .btn:not([aria-label="${next}"])`).first().click();
	await expect.poll(() => vibrations(page)).toEqual([15, 40]);
});
