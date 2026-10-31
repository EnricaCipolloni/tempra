import { expect, test, type Page } from '@playwright/test';
import { mockSupabase, SQUAD_CODE } from './supabase-mock';

const KEY = 'tempra.test.vibrations';

const recordVibrations = (page: Page) =>
	page.addInitScript((key) => {
		navigator.vibrate = (pattern) => {
			const calls = JSON.parse(sessionStorage.getItem(key) ?? '[]');
			sessionStorage.setItem(key, JSON.stringify([...calls, pattern]));

			return true;
		};
	}, KEY);

const vibrations = (page: Page) =>
	page.evaluate((key) => JSON.parse(sessionStorage.getItem(key) ?? '[]'), KEY);

const joinWithShortTrailBlock = async (page: Page) => {
	const state = await mockSupabase(page);
	state.config = { ...state.config, block_duration_s: 60, game_duration_s: 20, games: ['trail'] };

	await page.goto(`/athlete?code=${SQUAD_CODE}`);
	await page.fill('#join-name', 'Marco');
	await page.getByTestId('join-submit').click();
	await expect(page.getByTestId('athlete-home')).toBeVisible();

	await page.evaluate(() => {
		const squad = JSON.parse(localStorage.getItem('tempra.squad') ?? '{}');
		squad.config.block_duration_s = 12;
		squad.config.game_duration_s = 8;
		localStorage.setItem('tempra.squad', JSON.stringify(squad));
	});
	await page.reload();
	await expect(page.getByTestId('athlete-home')).toBeVisible();
};

test('taps and the end of a block vibrate, each with its own pattern', async ({ page }) => {
	await recordVibrations(page);
	await joinWithShortTrailBlock(page);
	await page.getByTestId('start-block').click();

	const cell = (n: number) => page.locator('.grid .btn', { hasText: new RegExp(`^${n}$`) });
	await expect(cell(1)).toBeVisible({ timeout: 10_000 });
	await cell(1).click();
	await cell(3).click();
	expect(await vibrations(page)).toEqual([15, 40]);

	await expect(page.getByRole('heading', { name: 'Blocco completato' })).toBeVisible({
		timeout: 30_000
	});
	expect(await vibrations(page)).toEqual([15, 40, [40, 60, 80]]);
});

test('aborting a block ticks once and skips the end pattern', async ({ page }) => {
	await recordVibrations(page);
	await joinWithShortTrailBlock(page);
	await page.getByTestId('start-block').click();

	await page.getByRole('button', { name: 'Interrompi' }).click();
	await expect(page.getByTestId('start-block')).toBeVisible();
	expect(await vibrations(page)).toEqual([15]);
});

test('the footer switch silences a block, survives a reload and ticks when turned back on', async ({
	page
}) => {
	await recordVibrations(page);
	await joinWithShortTrailBlock(page);

	const toggle = page.getByTestId('haptics-toggle');
	await expect(toggle).toBeChecked();
	await toggle.uncheck();
	await page.reload();
	await expect(page.getByTestId('athlete-home')).toBeVisible();
	await expect(toggle).not.toBeChecked();

	await page.getByTestId('start-block').click();
	await page.getByRole('button', { name: 'Interrompi' }).click();
	await expect(page.getByTestId('start-block')).toBeVisible();
	expect(await vibrations(page)).toEqual([]);

	await toggle.check();
	expect(await vibrations(page)).toEqual([15]);
});

test('the switch is hidden where the browser cannot vibrate', async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(navigator, 'vibrate', { value: undefined });
	});
	await mockSupabase(page);
	await page.goto('/');
	await expect(page.getByTestId('locale-select')).toBeVisible();
	await expect(page.getByTestId('haptics-toggle')).toHaveCount(0);
});
