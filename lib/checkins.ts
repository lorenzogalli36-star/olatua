import { supabase } from "./supabase";

const TZ = "Europe/Madrid";

export interface DayInfo {
  date: string;
  label: string;
  weekday: string;
  day: string;
}

export interface Checkin {
  id: string;
  spot_id: string;
  date: string;
  user_id: string;
  name: string;
}

export function madridToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

export function addDays(isoDate: string, n: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  dt.setUTCDate(dt.getUTCDate() + n);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function nextDays(n: number, today: string = madridToday()): DayInfo[] {
  return Array.from({ length: n }, (_, i) => {
    const date = addDays(today, i);
    const obj = new Date(`${date}T12:00:00Z`);
    const weekday = new Intl.DateTimeFormat("es-ES", { weekday: "short", timeZone: "UTC" }).format(obj).replace(".", "");
    const day = new Intl.DateTimeFormat("es-ES", { day: "numeric", timeZone: "UTC" }).format(obj);
    const label = i === 0 ? "Hoy" : i === 1 ? "Mañana" : weekday;
    return { date, label, weekday, day };
  });
}

export async function ensureAuth(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
  }
}

// Legge tutti i check-in in un intervallo di date (per l'agenda dei prossimi giorni).
export async function fetchUpcoming(fromDate: string, toDate: string): Promise<Checkin[]> {
  const { data, error } = await supabase
    .from("checkins")
    .select("id,spot_id,date,user_id,name")
    .gte("date", fromDate)
    .lte("date", toDate)
    .order("date", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as Checkin[]) ?? [];
}

export async function addCheckin(spotId: string, date: string, name: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("sin sesión");
  const { error } = await supabase.from("checkins").insert({ spot_id: spotId, date, user_id: user.id, name });
  if (error) throw error;
}

export async function removeCheckin(spotId: string, date: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("sin sesión");
  const { error } = await supabase
    .from("checkins").delete()
    .eq("spot_id", spotId).eq("date", date).eq("user_id", user.id);
  if (error) throw error;
}
