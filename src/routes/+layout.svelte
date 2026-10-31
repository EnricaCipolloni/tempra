<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import Brand from '$lib/components/ui/Brand.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import { LOCALE_NAME, SUPPORTED_LOCALES, type Locale } from '$lib/constants/locale.constants';
	import { hapticsSupported } from '$lib/services/haptics.service';
	import { hapticsStore, setHaptics } from '$lib/stores/haptics.store';
	import { localeStore, setLocale } from '$lib/stores/locale.store';
	import { t } from '$lib/utils/i18n.utils';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const tabs = $derived([
		{ href: '/athlete', label: t({ locale: $localeStore, key: 'nav.athlete' }) },
		{ href: '/coach', label: t({ locale: $localeStore, key: 'nav.coach' }) }
	]);

	const isActive = (href: string) => page.url.pathname.startsWith(href);

	// Screen readers and the browser's own hyphenation follow the chosen language.
	$effect(() => {
		document.documentElement.lang = $localeStore;
	});
</script>

<svelte:head>
	<title>{t({ locale: $localeStore, key: 'app.name' })}</title>
</svelte:head>

<div class="mx-auto flex min-h-full max-w-3xl flex-col gap-4 py-4">
	<header class="flex items-center justify-between gap-3">
		<a href="/" class="no-underline" aria-label={t({ locale: $localeStore, key: 'nav.home' })}>
			<Brand />
		</a>
		<nav class="flex gap-0.5" aria-label={t({ locale: $localeStore, key: 'nav.home' })}>
			{#each tabs as tab (tab.href)}
				<a
					href={tab.href}
					class="font-display px-3.5 py-2 text-base font-extrabold tracking-[.06em] uppercase italic no-underline [clip-path:polygon(10%_0,100%_0,90%_100%,0_100%)] {isActive(
						tab.href
					)
						? 'bg-accent text-on-accent'
						: 'bg-bg-3 text-fg-2'}"
					aria-current={isActive(tab.href) ? 'page' : undefined}
				>
					{tab.label}
				</a>
			{/each}
		</nav>
	</header>

	<main class="flex flex-1 flex-col gap-3">
		{@render children()}
	</main>

	<footer class="text-fg-2 flex flex-wrap items-center justify-between gap-2 text-xs">
		<span>{t({ locale: $localeStore, key: 'footer.made' })}</span>
		{#if hapticsSupported()}
			<label class="flex cursor-pointer items-center gap-1.5 py-1">
				<input
					type="checkbox"
					data-tid="haptics-toggle"
					checked={$hapticsStore}
					onchange={(e) => setHaptics(e.currentTarget.checked)}
				/>
				{t({ locale: $localeStore, key: 'haptics.label' })}
			</label>
		{/if}
		<span class="flex items-center gap-3">
			<a href="/privacy" class="text-fg-2" data-tid="footer-privacy">
				{t({ locale: $localeStore, key: 'footer.privacy' })}
			</a>
			<label class="flex cursor-pointer items-center gap-1.5">
				<svg
					viewBox="0 0 24 24"
					class="size-4"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"
				>
					<circle cx="12" cy="12" r="9" />
					<path
						d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9s1.3-6.3 3.8-9z"
					/>
				</svg>
				<select
					class="text-fg-2 cursor-pointer bg-transparent py-1 underline"
					aria-label={t({ locale: $localeStore, key: 'lang.label' })}
					data-tid="locale-select"
					value={$localeStore}
					onchange={(e) => setLocale(e.currentTarget.value as Locale)}
				>
					{#each SUPPORTED_LOCALES as locale (locale)}
						<option value={locale} lang={locale}>{LOCALE_NAME[locale]}</option>
					{/each}
				</select>
			</label>
			<span class="tnum">{t({ locale: $localeStore, key: 'app.version' })} {__APP_VERSION__}</span>
		</span>
	</footer>
</div>

<Toast />
