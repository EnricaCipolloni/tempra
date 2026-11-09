# Add copy or a locale

Title: `feat(i18n): ...` for a locale, otherwise the scope of the feature the copy belongs to.

## A new key

1. **Name it** `area.thing.detail` (flat dotted string), next to its siblings in `src/lib/constants/messages/it.ts`. The Italian catalog defines `I18nKey`.
2. **Add it to every catalog** (`it.ts`, `en.ts`, `pt-BR.ts`): `en` and `pt-BR` are `Record<I18nKey, string>`, so TypeScript fails on a gap, and `npm run lint` runs `scripts/check-locale-catalogs.mjs`.
3. **Write it short:** one idea, no explanation; an explanation goes behind an `InfoTip` ([`../frontend/README.md`](../frontend/README.md#copy)). Portuguese is Brazilian (você, celular, tela). No em dashes or en dashes in any locale.
4. **Read it** with `t({ locale: $localeStore, key, values })`; placeholders are `{name}`. Never inline a user-visible string in a component.
5. **e2e specs** are written against the Italian copy: update any that match the old text.

## A new locale

One PR touching, together: `SUPPORTED_LOCALES`, `LOCALE_TAG` and `LOCALE_NAME` (`src/lib/constants/locale.constants.ts`), the subtag map `BY_LANGUAGE` and `CATALOGS` in `src/lib/utils/i18n.utils.ts`, a new `src/lib/constants/messages/<locale>.ts` typed `Record<I18nKey, string>`, the catalog tests in `src/tests/i18n.test.ts`, and the locale list in [`../PRODUCT.md`](../PRODUCT.md) and [`../frontend/README.md`](../frontend/README.md#i18n).
