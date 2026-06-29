import { createClient } from "@supabase/supabase-js";

// URL e chiave PUBBLICA del progetto. Sono pensati apposta per stare nel codice
// del browser: la sicurezza vera la fanno le regole RLS sul database, non il
// nascondere questi due valori. La chiave SECRET non sta qui e non ci starà mai.
const SUPABASE_URL = "https://tgjliqwrklgebwoycgul.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_a-3FDu4Z8N3V5lbm-kNQ1A_PJ1BGm8E";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
