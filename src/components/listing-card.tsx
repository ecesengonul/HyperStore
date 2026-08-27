import Link from "next/link";

import { categoryLabel, formatPrice, formatSize } from "@/lib/constants";
import { photoUrl } from "@/lib/photos";
import type { ListingWithOwner } from "@/lib/types";

export function ListingCard({ listing }: { listing: ListingWithOwner }) {
  const cover = listing.photos[0];

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-foam">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl(cover)}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-ink-soft">
            No photo yet
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-ink">
          {categoryLabel(listing.category)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-1 font-medium text-ink">{listing.title}</h3>
        <p className="text-sm text-ink-soft">
          {listing.location} · {formatSize(listing.size_m)}
        </p>
        <p className="mt-auto pt-2 text-ink">
          <span className="font-semibold">{formatPrice(listing.hourly_price, listing.currency)}</span>
          <span className="text-sm text-ink-soft"> / hour</span>
        </p>
      </div>
    </Link>
  );
}
