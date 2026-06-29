import type { Level } from "./spots";

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
function angDiff(a: number, b: number) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

const DIRS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
export const dirName = (d: number) => DIRS[Math.round(d / 22.5) % 16];

export interface HourRec {
  time: string;
  h: number;
  date: string;
  wave: number;
  period: number;
  sst: number | null;
  windSpeed: number;
  windFrom: number;
}

export function windQuality(from: number, spd: number, offshore: number) {
  const diff = angDiff(from, offshore);
  const type: "offshore" | "cross" | "onshore" =
    diff < 55 ? "offshore" : diff > 125 ? "onshore" : "cross";
  let score: number;
  if (spd < 6) score = 0.95;
  else if (type === "offshore") score = spd < 20 ? 0.9 : spd < 32 ? 0.62 : 0.4;
  else if (type === "cross") score = spd < 12 ? 0.72 : spd < 22 ? 0.5 : 0.26;
  else score = spd < 10 ? 0.58 : spd < 18 ? 0.34 : spd < 28 ? 0.17 : 0.05;
  return { type, score, spd: Math.round(spd), from };
}

export function sizeQuality(h: number, level: Level) {
  if (h < 0.25) return { score: 0.05, flat: true, big: false };
  let hi: number, center: number;
  if (level === "experto") { hi = 3.6; center = 1.9; }
  else if (level === "intermedio") { hi = 2.0; center = 1.1; }
  else { hi = 1.6; center = 0.75; }
  const big = h > hi + 0.4 && level !== "experto";
  const s =
    h <= center
      ? clamp((h - 0.15) / (center - 0.15), 0, 1)
      : clamp(1 - (h - center) / ((hi - center) + 0.6), 0, 1);
  return { score: s, flat: false, big };
}

export function hourScore(rec: HourRec, spot: { level: Level; offshore: number }) {
  const sz = sizeQuality(rec.wave, spot.level);
  const wq = windQuality(rec.windFrom, rec.windSpeed, spot.offshore);
  const pb = rec.period >= 10 ? 0.1 : rec.period >= 8 ? 0.05 : rec.period < 6 ? -0.08 : 0;
  return { overall: clamp(sz.score * 0.55 + wq.score * 0.45 + pb, 0, 1), sz, wq };
}
export type Score = ReturnType<typeof hourScore>;

export function statusFor(score: Score, level: Level) {
  if (level === "experto") {
    if (score.sz.flat) return { cls: "flat", word: "Sin ola" };
    if (score.overall >= 0.55) return { cls: "good", word: "Calidad" };
    return { cls: "caution", word: "Irregular" };
  }
  if (score.sz.flat) return { cls: "flat", word: "Plano" };
  if (score.sz.big) return { cls: "big", word: "Grande" };
  if (score.wq.type === "onshore" && score.wq.spd >= 18) return { cls: "big", word: "Revuelto" };
  if (score.overall >= 0.68) return { cls: "good", word: "Bueno" };
  if (score.overall >= 0.5) return { cls: "good", word: "Correcto" };
  if (score.overall >= 0.34) return { cls: "caution", word: "Justito" };
  return { cls: "caution", word: "Flojo" };
}

export function reasonText(score: Score) {
  if (score.sz.flat) return "Plano, no hay ola para remar.";
  if (score.sz.big) return "Demasiado grande para empezar.";
  const sz =
    score.sz.score >= 0.7 ? "tamaño ideal" : score.sz.score >= 0.45 ? "tamaño correcto" : "ola pequeña";
  let w: string;
  if (score.wq.type === "offshore") w = score.wq.spd > 20 ? "terral fuerte pero limpio" : "viento terral, limpio";
  else if (score.wq.type === "cross") w = "viento de costado";
  else w = score.wq.spd >= 18 ? "viento de mar, revuelto" : "algo de viento de mar";
  return sz.charAt(0).toUpperCase() + sz.slice(1) + ", " + w + ".";
}

export function bestWindow(today: { h: number; score: Score }[]) {
  if (!today.length) return "—";
  const ok = today.map((r) => ({
    h: r.h,
    ok: r.score.overall >= 0.5 && !r.score.sz.big && !r.score.sz.flat,
  }));
  let best: { a: number; b: number } | null = null;
  let cur: { a: number; b: number } | null = null;
  for (const r of ok) {
    if (r.ok) {
      if (!cur) cur = { a: r.h, b: r.h };
      cur.b = r.h;
    } else if (cur) {
      if (!best || cur.b - cur.a > best.b - best.a) best = cur;
      cur = null;
    }
  }
  if (cur && (!best || cur.b - cur.a > best.b - best.a)) best = cur;
  if (best) return `${String(best.a).padStart(2, "0")}:00 a ${String(best.b + 1).padStart(2, "0")}:00`;
  let top = today[0];
  for (const r of today) if (r.score.overall > top.score.overall) top = r;
  return `pico ~${String(top.h).padStart(2, "0")}:00`;
}
