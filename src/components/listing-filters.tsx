"use client";

import Link from "next/link";
import { useState } from "react";

import { inputClass, labelClass, primaryButtonClass } from "@/components/ui";
import { CATEGORIES } from "@/lib/constants";
import type { ListingFilters } from "@/lib/listings";

/**
 * A plain GET form, so filters live in the URL and the page stays shareable
 * and server-rendered. Edits stage in the form and only reach the URL — and
 * so only refetch — when Apply is pressed, which also keeps this working
 * without JS. The parent remounts this on every applied change, so the
 * uncontrolled inputs re-read their defaults from the URL.
 */
export function ListingFiltersBar({
  filters,
  locations,
  resultCount,
}: {
  filters: ListingFilters;
  locations: string[];
  resultCount: number;
}) {
  const [dirty, setDirty] = useState(false);

  const isFiltered =
    Boolean(filters.category || filters.location) ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined;

  return (
    <form
      method="get"
      action="/listings"
      onChange={() => setDirty(true)}
      className="rounded-xl border border-line bg-white p-4"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className={labelClass} htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={filters.category ?? ""}
            className={inputClass}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="location">
            Location
          </label>
          <select
            id="location"
            name="location"
            defaultValue={filters.location ?? ""}
            className={inputClass}
          >
            <option value="">Anywhere in Turkey</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="minPrice">
            Min ₺ / hour
          </label>
          <input
            id="minPrice"
            name="minPrice"
            type="number"
            min={0}
            step={50}
            inputMode="numeric"
            placeholder="0"
            defaultValue={filters.minPrice ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="maxPrice">
            Max ₺ / hour
          </label>
          <input
            id="maxPrice"
            name="maxPrice"
            type="number"
            min={0}
            step={50}
            inputMode="numeric"
            placeholder="Any"
            defaultValue={filters.maxPrice ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="sort">
            Sort by
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={filters.sort}
            className={inputClass}
          >
            <option value="newest">Newest first</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="submit" className={primaryButtonClass}>
          Apply filters
        </button>
        {dirty && (
          <span role="status" className="text-sm text-sea">
            Unapplied changes
          </span>
        )}
        {isFiltered && (
          <Link href="/listings" className="text-sm text-ink-soft hover:text-ink">
            Clear all
          </Link>
        )}
        <span className="ml-auto text-sm text-ink-soft">
          {resultCount} {resultCount === 1 ? "listing" : "listings"}
        </span>
      </div>
    </form>
  );
}
