# Officina: come lavorano gli agenti su Tempra

[Officina](https://github.com/AntonioVentilii/officina) è l'officina che porta le richieste fino a una modifica pubblicata: un agente scrive la proposta (la "spec"), un agente la realizza, altri due la controllano, e una persona verifica il risultato prima che vada online. Questa pagina spiega cosa serve sapere per usarla; le regole che applica sono in [`.github/officina.yml`](../../.github/officina.yml).

Officina non cambia le regole del repository: lavora tramite una GitHub App che apre pull request, e GitHub chiede comunque che i controlli automatici passino e che le discussioni siano risolte prima di unire.

## Come procede una richiesta

1. **Richiesta.** Scrivi cosa vuoi con parole tue, dalla bacheca di Officina (il link arriva con l'invito). Se manca qualcosa, un agente ti fa al massimo quattro domande.
2. **Proposta.** Un agente legge il codice e scrive la spec con il [modello del repository](./spec-driven-development/template.md). Obiettivo e criteri di accettazione sono in italiano semplice.
3. **Approvazione della proposta.** Le persone indicate qui sotto la leggono, la commentano e la approvano. Senza approvazione non si costruisce nulla.
4. **Realizzazione.** Un agente fa la modifica su un ramo suo, esegue i controlli (`npm run quality`, `npm run check`, `npm test`, `npm run build`) e apre la pull request.
5. **Revisione.** Due agenti che non hanno scritto il codice la controllano: uno rispetto alla spec, l'altro per correttezza. Anche i commenti lasciati su GitHub tornano all'agente che costruisce.
6. **Verifica.** Una lista dice cosa guardare e con quanta cura. Le persone indicate provano il risultato e lo approvano, oppure lo rimandano indietro con un commento.
7. **Pubblicazione.** Con le approvazioni complete la modifica viene unita su GitHub e va online.

## Ogni modifica unita va online subito

Ogni unione su `main` pubblica il sito su https://tempra.ventilii.dev in pochi minuti: non c'è un ambiente di prova in mezzo. Per questo Officina non unisce mai nulla da sola: una persona controlla sempre il risultato prima che arrivi agli atleti. Le app Android e iOS invece escono solo con una release.

## Chi approva cosa

Le modifiche si dividono in tre zone, decise dai file che la modifica tocca davvero. Se una modifica tocca più zone vale la più severa.

| Zona         | Cosa copre                                                 | Costruisce un agente? | Approva la proposta        | Verifica il risultato                       |
| ------------ | ---------------------------------------------------------- | --------------------- | -------------------------- | ------------------------------------------- |
| **verde**    | solo i testi dell'app (`src/lib/constants/messages/`)      | sì                    | chi l'ha chiesta ed Enrica | chi l'ha chiesta                            |
| **standard** | tutto il resto: giochi, schermate, punteggi                | sì                    | Enrica                     | Enrica, quando la modifica si vede nell'app |
| **rossa**    | configurazione, database, dominio, app native (vedi sotto) | **no**                | Antonio                    | Antonio, che la realizza a mano             |

In ogni passaggio Officina aggiunge sempre l'approvazione di Antonio, che cura il codice. Enrica decide sul prodotto: cosa cambia per coach e atleti, i testi, l'aspetto. Antonio decide sul codice e sulle modifiche rischiose. Solo Antonio può segnare una modifica come "non visibile nell'app": nel dubbio la verifica tocca a Enrica.

## Cosa gli agenti non toccano mai

Gli agenti non costruiscono nella zona rossa: possono solo scrivere la proposta, poi la realizza una persona. Se una modifica arriva a toccare uno di questi file, Officina si ferma e chiede.

- Impostazioni e controlli di GitHub (`.github/`), compreso questo file di configurazione.
- Le dipendenze (`package.json`, `package-lock.json`).
- Il database Supabase e la sua chiave (`supabase/`, `src/lib/constants/supabase.constants.ts`).
- Il dominio (`static/CNAME`) e la configurazione che produce il sito (`svelte.config.js`, `vite.config.ts`).
- Le regole di stile e di TypeScript, le release e il changelog.
- Le app Android e iOS (`android/`, `ios/`, `capacitor.config.ts`).
- La licenza, la politica di sicurezza, gli script e le impostazioni degli strumenti (`scripts/`, `.claude/`).

In più un agente non unisce mai, non approva il proprio lavoro e scrive solo sul ramo del suo compito. L'elenco completo è in [`governance.md`](./governance.md) e in [`.github/officina.yml`](../../.github/officina.yml).

## Quando le regole cambiano

`.github/officina.yml` si modifica come ogni altro file, con una pull request scritta da una persona (è nella zona rossa) e decisa insieme a Enrica. Quando arriva su `main`, Officina usa le nuove regole. Una configurazione non valida viene scartata e restano in vigore quelle precedenti.
