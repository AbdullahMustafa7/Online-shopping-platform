import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Generic client for non-auth usage if needed
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Browser client that correctly syncs auth state to cookies
export const supabaseBrowser = () => createBrowserClient(supabaseUrl, supabaseAnonKey);

