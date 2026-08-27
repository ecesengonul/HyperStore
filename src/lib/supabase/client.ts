import { createBrowserClient } from "@supabase/ssr";

import { supabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/types";

/** Supabase client for use inside Client Components. */
export function createClient() {
  const { url, anonKey } = supabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}
