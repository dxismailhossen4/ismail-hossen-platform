import { createClient } from "@supabase/supabase-js";

// These are Supabase public browser connection values. Row-level security protects data access.
export const SUPABASE_URL = "https://pfyviyhdyjztqvvvibby.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_V8BlsMfB5VakOyFo8V2K5A_HpS4hVUU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
