import { PHOTO_BUCKET } from "@/lib/constants";

/**
 * Public CDN URL for a stored listing photo. The bucket is public, so this is
 * a pure string build — no round trip to Supabase needed.
 */
export function photoUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${PHOTO_BUCKET}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}
