# Olatua

Parte de olas de la costa de Bizkaia. Next.js 14 + Tailwind, pronto per diventare PWA.

Questo è lo scheletro di partenza. Gira da subito senza account esterni: mostra le
condizioni di oggi (onda, periodo, vento, temperatura acqua) per gli spot, con lo
spot consigliato in cima. I dati arrivano da Open-Meteo, gratis e senza chiave.

## Come avviarlo

Ti serve Node installato (versione 20 LTS consigliata: https://nodejs.org).
Dalla cartella del progetto, nel terminale:

```
npm install
npm run dev
```

Poi apri il browser su http://localhost:3000

`npm install` lo lanci una volta sola, scarica le dipendenze. `npm run dev` lo lanci
ogni volta che vuoi lavorarci, e si aggiorna da solo quando salvi un file.

## Cosa c'e' dentro

- `app/page.tsx` — la home, decide spot consigliato e lista
- `app/layout.tsx` — carica i font (Anton, Hanken Grotesk, JetBrains Mono) e il tema
- `lib/spots.ts` — la lista degli spot, con l'orientamento terral da tarare
- `lib/scoring.ts` — la logica del semaforo, portata dalla tua versione vanilla
- `lib/openmeteo.ts` — la chiamata a Open-Meteo, lato server
- `components/SpotCard.tsx` — la scheda di ogni spiaggia
- `tailwind.config.ts` — i colori e i font del design system in un posto solo

## Cosa NON c'e' ancora, e perche'

Tutto quello che ha bisogno di Supabase, che e' la fase 2:

- login anonimo e profili
- review e commenti sugli spot
- soglie personali e notifiche push (servono un progetto Supabase tuo e un job
  schedulato, lo montiamo insieme)
- il calendario "chi va" sui giorni futuri

Le icone in `public/icon.svg` sono provvisorie. La marea come dato va ancora
confermata: Open-Meteo da' onda, periodo, direzione e temperatura, la marea vera
potrebbe richiedere un'altra fonte. La verifico prima di aggiungerla.

## Deploy

Quando vuoi metterlo online: si collega la cartella a un repo GitHub e si importa
su Vercel. Lo facciamo quando la fase 2 e' pronta, non serve adesso.
