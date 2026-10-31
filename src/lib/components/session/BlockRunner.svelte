<script lang="ts">
	import { GAME_COMPONENTS } from '$lib/components/games';
	import Distractors from '$lib/components/session/Distractors.svelte';
	import {
		BLOCK_TAIL_S,
		INTERSTITIAL_MS,
		MIN_GAME_SLOT_S,
		NBACK_N,
		ladder
	} from '$lib/constants/config.constants';
	import { hapticBlockEnd, hapticTap, hapticTrial } from '$lib/services/haptics.service';
	import { localeStore } from '$lib/stores/locale.store';
	import type { Difficulty, GameKey, SquadConfig } from '$lib/types/config';
	import type { GameStats, TrialOutcome } from '$lib/types/result';
	import { t, type I18nKey } from '$lib/utils/i18n.utils';
	import { nonNullish } from '$lib/utils/nullish.utils';
	import { sleep } from '$lib/utils/random.utils';
	import { gameScore } from '$lib/utils/scoring.utils';
	import { formatClock } from '$lib/utils/time.utils';
	import { onMount } from 'svelte';

	interface Props {
		config: SquadConfig;
		difficulty: Difficulty;
		onDone: (games: GameStats[], durationMs: number) => void;
		onAbort: () => void;
		onGameChange?: (game: GameKey | undefined) => void;
	}

	let { config, difficulty, onDone, onAbort, onGameChange }: Props = $props();

	const total = $derived(config.block_duration_s);
	const games = $derived<GameKey[]>(config.games.length > 0 ? config.games : ['stroop']);

	let elapsedS = $state(0);
	let gameLeftS = $state(0);
	let currentGame = $state<GameKey | undefined>(undefined);
	let showingGame = $state(false);
	let finished: GameStats[] = [];
	let bankedScore = $state(0);
	let live = $state({ correct: 0, wrong: 0, rts: [] as number[] });
	let aborted = false;

	const liveScore = $derived(
		bankedScore +
			gameScore({ correct: live.correct, wrong: live.wrong, penalty: config.penalty_on_error })
	);
	const leftS = $derived(Math.max(0, total - elapsedS));
	const Game = $derived(nonNullish(currentGame) ? GAME_COMPONENTS[currentGame] : undefined);

	const onTrial = ({ correct, rt_ms }: TrialOutcome) => {
		hapticTrial({ correct, rt_ms });
		live = {
			correct: live.correct + (correct ? 1 : 0),
			wrong: live.wrong + (correct ? 0 : 1),
			rts: nonNullish(rt_ms) ? [...live.rts, rt_ms] : live.rts
		};
	};

	const hintFor = (key: GameKey) =>
		t({
			locale: $localeStore,
			key: `game.${key}.hint` as I18nKey,
			values: { n: ladder(NBACK_N, difficulty) }
		});

	const abort = () => {
		hapticTap();
		aborted = true;
	};

	onMount(() => {
		const startedAt = Date.now();
		const tick = setInterval(() => {
			elapsedS = (Date.now() - startedAt) / 1000;
		}, 250);

		const run = async () => {
			let index = 0;

			while (!aborted && (Date.now() - startedAt) / 1000 < total - BLOCK_TAIL_S) {
				const key = games[index % games.length];
				index++;
				const remaining = total - (Date.now() - startedAt) / 1000;
				const slotS = Math.max(
					MIN_GAME_SLOT_S,
					Math.min(config.game_duration_s, Math.floor(remaining))
				);

				currentGame = key;
				onGameChange?.(key);
				showingGame = false;
				await sleep(INTERSTITIAL_MS);

				if (aborted) {
					break;
				}

				live = { correct: 0, wrong: 0, rts: [] };
				showingGame = true;
				const gameStart = Date.now();
				gameLeftS = slotS;

				while (!aborted && Date.now() - gameStart < slotS * 1000) {
					gameLeftS = Math.ceil(slotS - (Date.now() - gameStart) / 1000);
					await sleep(200);
				}

				showingGame = false;
				const score = gameScore({
					correct: live.correct,
					wrong: live.wrong,
					penalty: config.penalty_on_error
				});
				finished = [
					...finished,
					{ game: key, correct: live.correct, wrong: live.wrong, rts_ms: live.rts, score }
				];
				bankedScore += score;
				live = { correct: 0, wrong: 0, rts: [] };
			}

			clearInterval(tick);
			onGameChange?.(undefined);

			if (aborted) {
				onAbort();

				return;
			}

			hapticBlockEnd();
			onDone(finished, Date.now() - startedAt);
		};

		void run();

		return () => {
			aborted = true;
			clearInterval(tick);
		};
	});
</script>

<div class="flex min-h-[70vh] flex-col gap-2.5">
	<div class="flex items-baseline justify-between gap-2">
		<div
			class="font-display tnum text-4xl leading-none font-extrabold {leftS <= 10
				? 'text-warn'
				: ''}"
		>
			{formatClock(leftS)}
		</div>
		<div class="font-display text-accent-2 text-lg font-bold tracking-[.08em] uppercase">
			{#if nonNullish(currentGame)}
				{t({ locale: $localeStore, key: `game.${currentGame}.name` as I18nKey })}
			{/if}
		</div>
		<div class="font-display tnum text-fg-2 text-2xl leading-none font-extrabold">
			{showingGame ? gameLeftS : ''}
		</div>
	</div>
	<div class="track">
		<i style="width: {Math.min(100, (elapsedS / total) * 100)}%;"></i>
	</div>

	<div
		class="card relative flex min-h-[300px] flex-1 flex-col items-center justify-center gap-4 py-4"
	>
		{#if nonNullish(currentGame) && nonNullish(Game)}
			{#if showingGame}
				{#key currentGame + ':' + bankedScore}
					<Game {difficulty} timePressure={config.time_pressure} {onTrial} />
				{/key}
			{:else}
				<div class="flex flex-col gap-2.5 text-center">
					<h3 class="text-fg-2 text-base font-bold tracking-[.08em]">
						{t({ locale: $localeStore, key: 'session.next' })}
					</h3>
					<div class="stim text-accent">
						{t({ locale: $localeStore, key: `game.${currentGame}.name` as I18nKey })}
					</div>
					<p class="hint">{hintFor(currentGame)}</p>
				</div>
			{/if}
		{/if}
		{#if config.distractors && showingGame}
			<Distractors />
		{/if}
	</div>

	<div class="flex items-center justify-between gap-2">
		<span class="text-fg-2 tnum">
			{t({ locale: $localeStore, key: 'session.points', values: { n: liveScore } })}
		</span>
		<button class="btn btn-ghost" onclick={abort}>
			{t({ locale: $localeStore, key: 'session.abort' })}
		</button>
	</div>
</div>
