"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { SPOTS } from "@/lib/spots";
import { supabase } from "@/lib/supabase";
import {
  nextDays,
  fetchCheckins,
  addCheckin,
  removeCheckin,
  ensureAuth,
  type DayInfo,
  type Checkin,
} from "@/lib/checkins";

const NAME_KEY = "olatua_name";

export default function PlanPage() {
  const [days] = useState<DayInfo[]>(() => nextDays(7));
  const [selected, setSelected] = useState<string>(() => nextDays(1)[0].date);
  const [name, setName] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await ensureAuth();
        const { data: { user } } = await supabase.auth.getUser();
        if (alive) setUserId(user?.id ?? null);
      } catch {
        if (alive) setError("No se pudo conectar. Recarga la página.");
      }
      const saved = typeof window !== "undefined" ? window.localStorage.getItem(NAME_KEY) : null;
      if (alive && saved) setName(saved);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const load = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const rows = await fetchCheckins(date);
      setCheckins(rows);
      setError(null);
    } catch {
      setError("No se pudieron cargar los planes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) load(selected);
  }, [userId, selected, load]);

  function saveName() {
    const n = nameInput.trim().slice(0, 24);
    if (!n) return;
    window.localStorage.setItem(NAME_KEY, n);
    setName(n);
  }

  async function toggle(spotId: string, mine: boolean) {
    if (!name) return;
    setBusy(spotId);
    try {
      if (mine) await removeCheckin(spotId, selected);
      else await addCheckin(spotId, selected, name);
      await load(selected);
    } catch {
      setError("No se pudo guardar. Inténtalo otra vez.");
    } finally {
      setBusy(null);
    }
  }

  const bySpot = (id: string) => checkins.filter((c) => c.spot_id === id);

  return (
    <main className="mx-auto max-w-[680px] px-4 pb-16 pt-5">
      <header className="flex items-end justify-between border-b-2 border-marea pb-3">
        <div>
          <h1 className="font-display text-5xl uppercase tracking-wide text-foam">Plan</h1>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-foam-faint">
            quién va, qué día
          </p>
        </div>
        <Link
          href="/"
          className="flex-shrink-0 rounded-full border border-marea/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-marea"
        >
          ← hoy
        </Link>
      </header>

      {error && (
        <div className="mt-4 rounded-card border border-coral/40 bg-surface p-3 font-mono text-[11px] text-foam-dim">
          {error}
        </div>
      )}

      {!name ? (
        <section className="mt-6 rounded-card bg-surface p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-marea">antes de empezar</p>
          <h2 className="mt-1 font-display text-2xl uppercase text-foam">¿Cómo te llamas?</h2>
          <p className="mb-3 mt-1 text-sm text-foam-dim">Para que Haizea sepa que eres tú quien va.</p>
          <div className="flex gap-2">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              placeholder="tu nombre"
              className="flex-1 rounded-lg border border-line bg-navy px-3 py-2 text-foam outline-none placeholder:text-foam-faint focus:border-marea"
            />
            <button
              onClick={saveName}
              className="rounded-lg bg-marea px-4 py-2 font-mono text-sm uppercase text-white"
            >
              ok
            </button>
          </div>
        </section>
      ) : (
        <>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {days.map((d) => {
              const active = d.date === selected;
              return (
                <button
                  key={d.date}
                  onClick={() => setSelected(d.date)}
                  className={`flex min-w-[58px] flex-col items-center rounded-xl border px-2 py-2 ${
                    active ? "border-marea bg-marea/20" : "border-line bg-surface"
                  }`}
                >
                  <span
                    className={`font-mono text-[9px] uppercase tracking-wide ${
                      active ? "text-marea" : "text-foam-faint"
                    }`}
                  >
                    {d.label}
                  </span>
                  <span className="font-display text-xl leading-none text-foam">{d.day}</span>
                </button>
              );
            })}
          </div>

          <div className="mb-2 mt-5 flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foam-faint">
              elige spot
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <div className="space-y-2.5">
            {SPOTS.map((spot) => {
              const list = bySpot(spot.id);
              const mine = userId ? list.some((c) => c.user_id === userId) : false;
              return (
                <article key={spot.id} className="rounded-card border border-line bg-surface p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg uppercase leading-none text-foam">{spot.name}</h3>
                      {list.length > 0 ? (
                        <p className="mt-1.5 truncate font-mono text-[11px] text-foam-dim">
                          {list.map((c) => c.name).join(", ")}
                        </p>
                      ) : (
                        <p className="mt-1.5 font-mono text-[11px] text-foam-faint">nadie todavía</p>
                      )}
                    </div>
                    <button
                      onClick={() => toggle(spot.id, mine)}
                      disabled={busy === spot.id || loading}
                      className={`flex-shrink-0 rounded-lg px-3.5 py-2 font-mono text-[11px] uppercase tracking-wide text-white disabled:opacity-50 ${
                        mine ? "bg-coral" : "bg-marea"
                      }`}
                    >
                      {busy === spot.id ? "..." : mine ? "no voy" : "voy"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <footer className="mt-8 border-t border-line pt-3 font-mono text-[9.5px] leading-relaxed text-foam-faint">
            Tu nombre se guarda solo en este teléfono. Pulsa "voy" para apuntarte, "no voy" para quitarte.
          </footer>
        </>
      )}
    </main>
  );
}
