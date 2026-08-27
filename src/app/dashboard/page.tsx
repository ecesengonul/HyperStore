import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteListing } from "@/app/listings/actions";
import { SetupNotice } from "@/components/setup-notice";
import { cardClass, primaryButtonClass } from "@/components/ui";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { categoryLabel, formatPrice, formatSize } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/env";
import { fetchOwnerListings } from "@/lib/listings";
import { photoUrl } from "@/lib/photos";

export const metadata = { title: "My listings" };

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="px-4 py-12">
        <SetupNotice />
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  if (!isOwner(user)) redirect("/listings");

  const listings = await fetchOwnerListings(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My listings</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {listings.length} {listings.length === 1 ? "item" : "items"} on the marketplace.
          </p>
        </div>
        <Link href="/listings/new" className={primaryButtonClass}>
          List equipment
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line px-6 py-16 text-center">
          <p className="font-medium">Nothing listed yet</p>
          <p className="mt-1 text-sm text-ink-soft">
            Add your first jetski, foil or boat and it appears in the feed immediately.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {listings.map((listing) => (
            <li key={listing.id} className={`${cardClass} flex flex-wrap items-center gap-4 p-4`}>
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-foam">
                {listing.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl(listing.photos[0])}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-ink-soft">
                    No photo
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Link href={`/listings/${listing.id}`} className="font-medium hover:underline">
                  {listing.title}
                </Link>
                <p className="text-sm text-ink-soft">
                  {categoryLabel(listing.category)} · {listing.location} ·{" "}
                  {formatSize(listing.size_m)}
                </p>
                <p className="text-sm text-ink">
                  {formatPrice(listing.hourly_price, listing.currency)} / hour
                </p>
              </div>

              <form action={deleteListing}>
                <input type="hidden" name="id" value={listing.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-line px-3 py-2 text-sm text-ink-soft transition hover:border-red-300 hover:text-red-700"
                >
                  Delete
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
