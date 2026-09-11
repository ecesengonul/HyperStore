import Link from "next/link";
import { notFound } from "next/navigation";

import { PhotoGallery } from "@/components/photo-gallery";
import { SetupNotice } from "@/components/setup-notice";
import { cardClass, secondaryButtonClass } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { categoryLabel, formatPrice, formatSize } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/env";
import { fetchListing } from "@/lib/listings";

// The id comes from the URL; anything that is not a UUID cannot be a listing.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) return { title: "Listing" };
  const { id } = await params;
  if (!UUID.test(id)) return { title: "Listing not found" };

  const listing = await fetchListing(id);
  return {
    title: listing?.title ?? "Listing not found",
    description: listing?.description?.slice(0, 160),
  };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="px-4 py-12">
        <SetupNotice />
      </div>
    );
  }

  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const [listing, user] = await Promise.all([fetchListing(id), getCurrentUser()]);
  if (!listing) notFound();

  const isMine = user?.id === listing.owner_id;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/listings" className="text-sm text-ink-soft transition hover:text-ink active:text-sea">
        ← Back to all listings
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <PhotoGallery photos={listing.photos} title={listing.title} />

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{listing.title}</h1>
            <p className="mt-1 text-sm text-ink-soft">
              {categoryLabel(listing.category)} · {listing.location} · {formatSize(listing.size_m)}
            </p>
          </div>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Description
            </h2>
            <p className="mt-2 whitespace-pre-line text-ink">
              {listing.description.trim() || "The owner has not added a description yet."}
            </p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className={`${cardClass} p-5`}>
            <p className="text-2xl font-semibold">
              {formatPrice(listing.hourly_price, listing.currency)}
              <span className="text-base font-normal text-ink-soft"> / hour</span>
            </p>

            <dl className="mt-5 space-y-3 text-sm">
              <Detail label="Category" value={categoryLabel(listing.category)} />
              <Detail label="Size" value={formatSize(listing.size_m)} />
              <Detail label="Location" value={listing.location} />
              <Detail label="Listed by" value={listing.owner?.full_name || "HyperStore owner"} />
              <Detail
                label="Listed on"
                value={new Date(listing.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
            </dl>

            {isMine ? (
              <Link href="/dashboard" className={`${secondaryButtonClass} mt-5 w-full`}>
                Manage my listings
              </Link>
            ) : (
              <p className="mt-5 rounded-lg bg-foam px-3 py-3 text-sm text-ink-soft">
                Booking and messaging are coming soon. For now, note the item and get in touch with
                the owner off-platform.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
