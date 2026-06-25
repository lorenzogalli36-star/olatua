import { SPOTS } from "./spots";
import { hourScore, type HourRec, type Score } from "./scoring";

const TZ = "Europe/Madrid";

function madridNow() {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  });
  const p: Record<string, string> = {};
  for (const part of f.formatToParts(new Date())) p[part.type] = part.value;
  const hour = p.hour === "24" ? 0 : Number(p.hour);
  return { date: `${p.year}-${p.month}-${p.day}`, hour };
}

interface Hourly {
  time: string[];
  [k: string]: unknown;
}

export interface SpotConditions {
  spot: (typeof SPOTS)[number];
  cur: HourRec & { score: Score };
  today: (HourRec & { score: Score })[];
}

export async function fetchConditions(): Promise<SpotConditions[]> {
  const lats = SPOTS.map((s) => s.lat).join(",");
  const lons = SPOTS.map((s) => s.lon).join(",");

  const marineURL =
    `https://marine-api.open-meteo.com/v1/marine?latitude=${lats}&longitude=${lons}` +
    `&hourly=wave_height,wave_period,wave_direction,sea_surface_temperature` +
    `&length_unit=metric&timezone=Europe%2FMadrid&forecast_days=2`;
  const windURL =
    `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}` +
    `&hourly=wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh` +
    `&timezone=Europe%2FMadrid&forecast_days=2`;

  const [mRes, wRes] = await Promise.all([
    fetch(marineURL, { next: { revalidate: 1800 } }),
    fetch(windURL, { next: { revalidate: 1800 } }),
  ]);
  if (!mRes.ok || !wRes.ok) throw new Error("open-meteo unreachable");

  const mJson = await mRes.json();
  const wJson = await wRes.json();
  const marine: { hourly: Hourly }[] = Array.isArray(mJson) ? mJson : [mJson];
  const wind: { hourly: Hourly }[] = Array.isArray(wJson) ? wJson : [wJson];

  const now = madridNow();

  const out = SPOTS.map((spot, i) => {
    const mh = marine[i].hourly;
    const wh = wind[i].hourly;
    const waveH = mh.wave_height as number[];
    const waveP = mh.wave_period as number[];
    const sst = mh.sea_surface_temperature as number[];
    const wSpd = wh.wind_speed_10m as number[];
    const wDir = wh.wind_direction_10m as number[];

    const windByTime: Record<string, { spd: number; dir: number }> = {};
    wh.time.forEach((t, k) => (windByTime[t] = { spd: wSpd[k], dir: wDir[k] }));

    const recs: HourRec[] = mh.time.map((t, k) => {
      const w = windByTime[t] ?? { spd: 0, dir: 0 };
      return {
        time: t,
        h: Number(t.slice(11, 13)),
        date: t.slice(0, 10),
        wave: waveH[k] ?? 0,
        period: waveP[k] ?? 0,
        sst: sst[k] ?? null,
        windSpeed: w.spd,
        windFrom: w.dir,
      };
    });

    const today = recs
      .filter((r) => r.date === now.date && r.h >= 6 && r.h <= 21)
      .map((r) => ({ ...r, score: hourScore(r, spot) }));

    if (!today.length) return null;
    const cur =
      today.find((r) => r.h === now.hour) ??
      today.reduce((p, r) => (Math.abs(r.h - now.hour) < Math.abs(p.h - now.hour) ? r : p), today[0]);

    return { spot, cur, today };
  });

  return out.filter((c): c is SpotConditions => c !== null);
}
