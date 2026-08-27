import Link from "next/link";

import { ListingCard } from "@/components/listing-card";
import { ListingFiltersBar } from "@/components/listing-filters";
import { SetupNotice } from "@/components/setup-notice";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { fetchListings, fetchLocations, hasActiveFilters, parseFilters } from "@/lib/listings";

export const metadata = { title: "Browse listings" };

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="px-4 py-12">
        <SetupNotice />
      </div>
    );
  }

  const filters = parseFilters(await searchParams);
  const [listings, locations, user] = await Promise.all([
    fetchListings(filters),
    fetchLocations(),
    getCurrentUser(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Sea toys &amp; equipment</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Hourly rentals from owners along the Turkish coast.
        </p>
      </header>

      <ListingFiltersBar filters={filters} locations={locations} resultCount={listings.length} />

      {listings.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-line px-6 py-16 text-center">
          <p className="font-medium text-ink">
            {hasActiveFilters(filters) ? "Nothing matches those filters" : "No listings yet"}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {hasActiveFilters(filters)
              ? "Try a wider price range, another location, or clear the filters."
              : "Be the first to put equipment on HyperStore."}
          </p>
          {hasActiveFilters(filters) ? (
            <Link href="/listings" className="mt-4 inline-block text-sm font-medium text-sea hover:underline">
              Clear all filters
            </Link>
          ) : (
            <Link
              href={isOwner(user) ? "/listings/new" : "/signup?role=owner"}
              className="mt-4 inline-block text-sm font-medium text-sea hover:underline"
            >
              List your equipment
            </Link>
          )}
        </div>
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <li key={listing.id}>
              <ListingCard listing={listing} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
