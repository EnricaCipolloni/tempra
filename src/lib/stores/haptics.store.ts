import { hapticTap, setHapticsEnabled } from '$lib/services/haptics.service';
import { readLocal, writeLocal } from '$lib/utils/storage.utils';
import { writable } from 'svelte/store';

const KEY = 'haptics';

export const hapticsStore = writable<boolean>(readLocal<boolean>(KEY) ?? true);

hapticsStore.subscribe(setHapticsEnabled);

export const setHaptics = (on: boolean) => {
	writeLocal(KEY, on);
	hapticsStore.set(on);

	// Turning it on is the one tap that proves it works.
	if (on) {
		hapticTap();
	}
};
