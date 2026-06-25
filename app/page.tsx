import { fetchConditions, type SpotConditions } from "@/lib/openmeteo";
import { statusFor, reasonText, bestWindow, dirName } from "@/lib/scoring";
import SpotCard from "@/components/SpotCard";

export const revalidate = 1800;

export default async function Home() {
  let conditions: SpotConditions[] | null = null;
  try {
    conditions = await fetchConditions();
  } catch {
    conditions = null;
  }

  const ranked = conditions
    ? [...conditions]
        .filter((c) => c.spot.level !== "experto")
        .sort((a, b) => b.cur.score.overall - a.cur.score.overall)
    : [];
  const allUnusable = ranked.every((c) => c.cur.score.sz.flat || c.cur.score.sz.big);
  const hero = ranked.length && !allUnusable ? ranked[0] : null;

  return (
    <main className="mx-auto max-w-[680px] px-4 pb-16 pt-5">
      <header className="flex items-end justify-between border-b-2 border-marea pb-3">
        <div>
          <h1 className="font-display text-5xl uppercase tracking-wide text-foam">Olatua</h1>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-foam-faint">
            parte de olas · costa de bizkaia
          </p>
        </div>
      </header>

      {!conditions && (
        <div className="mt-10 rounded-card border border-line bg-surface p-8 text-center">
          <p className="font-display text-3xl uppercase text-foam">Sin señal</p>
          <p className="mt-2 font-mono text-xs text-foam-dim">
            No llega el parte del mar ahora mismo. Vuelve a cargar en un momento.
          </p>
        </div>
      )}

      {hero && (
        <section className="mt-5 rounded-card bg-surface p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-marea">recomendado para hoy</p>
          <h2 className="mt-1 font-display text-4xl uppercase text-foam">{hero.spot.name}</h2>
          <p className="font-mono text-[11px] tracking-wide text-foam-faint">{hero.spot.zone}</p>
          <p className="mt-2 max-w-[34ch] text-sm text-foam-dim">{reasonText(hero.cur.score)}</p>
        </section>
      )}

      {conditions && (
        <>
          <div className="mb-3 mt-6 flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foam-faint">
              todas las playas
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <div className="space-y-3">
            {conditions.map((c) => (
              <SpotCard
                key={c.spot.id}
                name={c.spot.name}
                zone={c.spot.zone}
                expert={c.spot.level === "experto"}
                status={statusFor(c.cur.score, c.spot.level)}
                wave={c.cur.wave}
                period={c.cur.period}
                windSpeed={c.cur.windSpeed}
                windDir={dirName(c.cur.windFrom)}
                sst={c.cur.sst}
                window={bestWindow(c.today)}
              />
            ))}
          </div>
        </>
      )}

      <footer className="mt-8 border-t border-line pt-3 font-mono text-[9.5px] leading-relaxed text-foam-faint">
        Datos: Open-Meteo Marine y viento. Sin coste, sin clave. El mar manda: si dudas, no entres.
        Mundaka es ola de expertos.
      </footer>
    </main>
  );
}
