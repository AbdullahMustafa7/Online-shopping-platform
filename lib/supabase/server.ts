import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Next.js 16 cookies() may not expose getAll in some contexts.
        // Fall back to an empty array so Supabase can still operate.
        getAll() {
          return typeof cookieStore.getAll === "function"
            ? cookieStore.getAll()
            : [];
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component where cookies are read-only.
          }
        },
      },
    },
  );
}

