import { createClient } from "@supabase/supabase-js";

// Temporary: hardcoded Supabase project values while env loading is fixed.
const SUPABASE_URL = "https://yanhjkrrtnwzefjqsysk.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_CvoojVL9Nh7WnthgKuHANw_8icpk";

export const supabaseBrowser = () =>
  createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

