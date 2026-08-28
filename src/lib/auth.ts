import { cache } from "react";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export type CurrentUser = {
  id: string;
  email: string | null;
  profile: Profile | null;
};

/**
 * The signed-in user plus their HyperStore profile (which carries the
 * renter/owner role), or null when nobody is signed in.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return { id: user.id, email: user.email ?? null, profile: profile ?? null };
});

export function isOwner(user: CurrentUser | null) {
  return user?.profile?.role === "owner";
}
