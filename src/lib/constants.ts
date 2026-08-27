import type { ListingCategory } from "@/lib/types";

export const CATEGORIES: { value: ListingCategory; label: string; emoji: string }[] = [
  { value: "foil", label: "Foils", emoji: "🪂" },
  { value: "jetski", label: "Jetskis", emoji: "🌊" },
  { value: "sea_scooter", label: "Sea scooters", emoji: "🤿" },
  { value: "catamaran", label: "Catamarans", emoji: "⛵" },
  { value: "small_boat", label: "Small boats", emoji: "🚤" },
  { value: "extreme_gear", label: "Extreme sports gear", emoji: "🏄" },
  { value: "other", label: "Other", emoji: "⚓" },
];

const CATEGORY_LABELS = new Map(CATEGORIES.map((c) => [c.value, c.label]));

export function categoryLabel(value: string) {
  return CATEGORY_LABELS.get(value as ListingCategory) ?? "Other";
}

export function isCategory(value: string): value is ListingCategory {
  return CATEGORY_LABELS.has(value as ListingCategory);
}

/**
 * Suggested locations for the Turkey launch. Owners can type anything else —
 * the field is free text, this list just keeps the common spellings tidy.
 */
export const SUGGESTED_LOCATIONS = [
  "Alaçatı",
  "Alanya",
  "Antalya",
  "Ayvalık",
  "Bodrum",
  "Bozcaada",
  "Çeşme",
  "Datça",
  "Didim",
  "Fethiye",
  "Foça",
  "Göcek",
  "İstanbul",
  "Kalkan",
  "Kaş",
  "Kuşadası",
  "Marmaris",
  "Side",
  "Urla",
];

export const MIN_SIZE_M = 0.5;
export const MAX_SIZE_M = 10;

export const MAX_PHOTOS = 6;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // keep in sync with the storage bucket
export const PHOTO_BUCKET = "listing-photos";

export function formatPrice(amount: number, currency = "TRY") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSize(sizeM: number) {
  const rounded = Math.round(sizeM * 100) / 100;
  return `${rounded} m`;
}
