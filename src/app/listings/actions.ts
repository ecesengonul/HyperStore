"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser, isOwner } from "@/lib/auth";
import { MAX_PHOTOS, MAX_SIZE_M, MIN_SIZE_M, isCategory } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export type ListingFormState = { error?: string };

export async function createListing(
  _prev: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You need to sign in first." };
  if (!isOwner(user)) {
    return { error: "Only owner accounts can publish listings." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const sizeM = Number(formData.get("size_m"));
  const hourlyPrice = Number(formData.get("hourly_price"));
  const photos = formData
    .getAll("photos")
    .map((value) => String(value))
    .filter(Boolean);

  if (title.length < 3 || title.length > 120) {
    return { error: "Give the listing a title between 3 and 120 characters." };
  }
  if (!isCategory(category)) {
    return { error: "Pick a category." };
  }
  if (description.length > 4000) {
    return { error: "Description is too long (4000 characters max)." };
  }
  if (location.length < 2) {
    return { error: "Where is the equipment based?" };
  }
  if (!Number.isFinite(sizeM) || sizeM < MIN_SIZE_M || sizeM > MAX_SIZE_M) {
    return { error: `Size must be between ${MIN_SIZE_M} and ${MAX_SIZE_M} metres.` };
  }
  if (!Number.isFinite(hourlyPrice) || hourlyPrice < 0) {
    return { error: "Enter an hourly price of 0 or more." };
  }
  if (photos.length > MAX_PHOTOS) {
    return { error: `Up to ${MAX_PHOTOS} photos per listing.` };
  }
  // Photos are uploaded straight to Storage from the browser, into a folder
  // named after the user. Re-check here so a crafted form can't point a
  // listing at somebody else's files.
  if (photos.some((path) => !path.startsWith(`${user.id}/`))) {
    return { error: "Those photos could not be attached. Please re-upload them." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .insert({
      owner_id: user.id,
      title,
      category,
      description,
      location,
      size_m: sizeM,
      hourly_price: hourlyPrice,
      photos,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/listings");
  revalidatePath("/dashboard");
  redirect(`/listings/${data.id}`);
}

export async function deleteListing(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  // RLS also restricts this to the owner; the filter keeps the intent explicit.
  await supabase.from("listings").delete().eq("id", id).eq("owner_id", user.id);

  revalidatePath("/listings");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
