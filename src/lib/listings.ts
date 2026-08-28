import { isCategory } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { ListingCategory, ListingWithOwner } from "@/lib/types";

const OWNER_JOIN = "*, owner:profiles!listings_owner_id_fkey(id, full_name, role)";

export type ListingSort = "newest" | "price_asc" | "price_desc";

export type ListingFilters = {
  category?: ListingCategory;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  sort: ListingSort;
};

/** Turn raw query-string values into a validated filter object. */
export function parseFilters(params: Record<string, string | string[] | undefined>): ListingFilters {
  const one = (key: string) => {
    const value = params[key];
    const raw = Array.isArray(value) ? value[0] : value;
    return raw?.trim() || undefined;
  };

  const number = (key: string) => {
    const raw = one(key);
    if (raw === undefined) return undefined;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
  };

  const category = one("category");
  const sort = one("sort");

  return {
    category: category && isCategory(category) ? category : undefined,
    location: one("location"),
    minPrice: number("minPrice"),
    maxPrice: number("maxPrice"),
    sort: sort === "price_asc" || sort === "price_desc" ? sort : "newest",
  };
}

export function hasActiveFilters(filters: ListingFilters) {
  return Boolean(
    filters.category ||
      filters.location ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined,
  );
}

export async function fetchListings(filters: ListingFilters) {
  const supabase = await createClient();

  let query = supabase.from("listings").select(OWNER_JOIN).eq("is_published", true);

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.location) query = query.ilike("location", filters.location);
  if (filters.minPrice !== undefined) query = query.gte("hourly_price", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("hourly_price", filters.maxPrice);

  query =
    filters.sort === "price_asc"
      ? query.order("hourly_price", { ascending: true })
      : filters.sort === "price_desc"
        ? query.order("hourly_price", { ascending: false })
        : query.order("created_at", { ascending: false });

  const { data, error } = await query.limit(60);
  if (error) throw new Error(error.message);

  return (data ?? []) as unknown as ListingWithOwner[];
}

export async function fetchListing(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("listings").select(OWNER_JOIN).eq("id", id).maybeSingle();

  // PGRST116 = no rows matched; treat as "not found" rather than an error.
  if (error && error.code !== "PGRST116") throw new Error(error.message);

  return (data as unknown as ListingWithOwner | null) ?? null;
}

export async function fetchOwnerListings(ownerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(OWNER_JOIN)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ListingWithOwner[];
}

/** Locations that actually have listings, for the feed's location filter. */
export async function fetchLocations() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("location")
    .eq("is_published", true);

  if (error) throw new Error(error.message);

  const seen = new Map<string, string>();
  for (const row of data ?? []) {
    const key = row.location.trim().toLocaleLowerCase("tr");
    if (!seen.has(key)) seen.set(key, row.location.trim());
  }

  return [...seen.values()].sort((a, b) => a.localeCompare(b, "tr"));
}
