import type { Difficulty, SquadConfig } from '$lib/types/config';

/** Mirrors `public.default_squad_config()` in the Supabase migration. */
export const DEFAULT_SQUAD_CONFIG: SquadConfig = {
	difficulty: 3,
	games: ['stroop', 'gonogo', 'nback', 'flanker', 'math', 'trail'],
	block_duration_s: 90,
	game_duration_s: 30,
	time_pressure: true,
	distractors: false,
	penalty_on_error: true,
	auto_adapt: false,
	message: ''
};

export const BLOCK_DURATIONS_S = [60, 90, 120, 180, 240] as const;
export const GAME_DURATIONS_S = [20, 30, 45, 60] as const;

/** Seconds of block left under which no new game is started. */
export const BLOCK_TAIL_S = 3;
/** Shortest game slot worth starting when the block is nearly over. */
export const MIN_GAME_SLOT_S = 8;
/** Pause between games showing the next game's name and rule. */
export const INTERSTITIAL_MS = 1500;

export const SQUAD_CODE_LENGTH = 6;

/** Fallback polling interval when realtime is unavailable. */
export const CONFIG_POLL_MS = 20_000;
export const RESULTS_POLL_MS = 10_000;

/** Pick the value for a difficulty level out of a 5-entry ladder. */
export const ladder = <T>(values: readonly [T, T, T, T, T], difficulty: Difficulty): T =>
	values[difficulty - 1];

export const NBACK_N = [1, 1, 2, 2, 3] as const;
