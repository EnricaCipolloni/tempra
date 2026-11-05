<script lang="ts">
	import TrialTimer from '$lib/components/session/TrialTimer.svelte';
	import { ladder } from '$lib/constants/config.constants';
	import { localeStore } from '$lib/stores/locale.store';
	import type { GameProps } from '$lib/types/game';
	import { t, type I18nKey } from '$lib/utils/i18n.utils';
	import { pick, shuffle, sleep } from '$lib/utils/random.utils';
	import { createTrialGate } from '$lib/utils/trial.utils';
	import { onMount } from 'svelte';

	let { difficulty, timePressure, onTrial }: GameProps = $props();

	interface Ink {
		key: I18nKey;
		// Button label: initials collide in some languages (pt-BR Vermelho / Verde).
		short: I18nKey;
		hex: string;
	}

	const COLORS: Ink[] = [
		{ key: 'color.red', short: 'color.red.short', hex: '#ff5a5a' },
		{ key: 'color.green', short: 'color.green.short', hex: '#4fd38a' },
		{ key: 'color.blue', short: 'color.blue.short', hex: '#6fa8ff' },
		{ key: 'color.yellow', short: 'color.yellow.short', hex: '#ffc857' }
	];

	const windowMs = $derived(ladder([2500, 2000, 1600, 1300, 1000], difficulty));
	const congruentP = $derived(ladder([0.6, 0.5, 0.4, 0.3, 0.2], difficulty));
	// From level 4 the answer buttons are themselves mis-coloured: extra interference.
	const scrambleButtons = $derived(difficulty >= 4);

	let word = $state<Ink>(COLORS[0]);
	let ink = $state<Ink>(COLORS[0]);
	let buttons = $state<Ink[]>(COLORS);
	let trialId = $state(0);
	let gate = createTrialGate<Ink>();

	const answer = (choice: Ink | null) => gate.answer(choice);

	onMount(() => {
		let active = true;

		const loop = async () => {
			while (active) {
				const w = pick(COLORS);
				const i = Math.random() < congruentP ? w : pick(COLORS.filter((c) => c !== w));
				word = w;
				ink = i;
				buttons = scrambleButtons ? shuffle(COLORS) : COLORS;
				gate = createTrialGate<Ink>();
				trialId++;
				const started = performance.now();
				const choice = await gate.wait();

				if (!active) {
					break;
				}

				// Compare by key: `buttons` is deep $state, so a tapped colour is a proxy, never `=== i`.
				const correct = choice?.key === i.key;

				onTrial({
					correct,
					rt_ms: correct ? Math.round(performance.now() - started) : null
				});
				await sleep(220);
			}
		};

		void loop();

		return () => {
			active = false;
			gate.answer(null);
		};
	});
</script>

<div class="stim" style="color: {ink.hex};">{t({ locale: $localeStore, key: word.key })}</div>
<div class="answers answers-4">
	{#each buttons as colour, index (colour.key)}
		<button
			class="btn btn-pad"
			style="background: {scrambleButtons
				? COLORS[(index + 1) % 4].hex
				: colour.hex}; color: #15181c;"
			aria-label={t({ locale: $localeStore, key: colour.key })}
			onclick={() => answer(colour)}
		>
			{t({ locale: $localeStore, key: colour.short })}
		</button>
	{/each}
</div>
{#if timePressure}
	{#key trialId}
		<div class="w-full max-w-[420px]">
			<TrialTimer durationMs={windowMs} onExpire={() => answer(null)} />
		</div>
	{/key}
{/if}
<p class="hint">{t({ locale: $localeStore, key: 'game.stroop.hint' })}</p>
