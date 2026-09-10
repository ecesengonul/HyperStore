"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export type AuthFormState = { error?: string; notice?: string };

function readEmail(formData: FormData) {
  return String(formData.get("email") ?? "").trim().toLowerCase();
}

export async function signIn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readEmail(formData);
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(safeRedirect(next));
}

export async function signUp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readEmail(formData);
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role") ?? "renter") as UserRole;

  if (!fullName) return { error: "Tell us your name." };
  if (!email) return { error: "Enter your email address." };
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (role !== "renter" && role !== "owner") {
    return { error: "Choose whether you want to rent or to list." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Read by the handle_new_user() trigger to create the profile row.
    options: { data: { full_name: fullName, role } },
  });

  if (error) {
    return { error: error.message };
  }

  // With email confirmation switched on, Supabase returns a user but no
  // session — nothing to redirect to until they click the link.
  if (!data.session) {
    return {
      notice: `Almost there — we sent a confirmation link to ${email}. Confirm it, then sign in.`,
    };
  }

  revalidatePath("/", "layout");
  redirect(role === "owner" ? "/dashboard" : "/listings");
}

/**
 * Turn a renter account into an owner one. The header points renters here via
 * /listings/new; RLS ("users update their own profile") is what actually
 * limits this to the caller's own row.
 */
export async function becomeOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/listings/new");

  const { error } = await supabase
    .from("profiles")
    .update({ role: "owner" })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/** Only allow same-origin paths, so `?next=` can't bounce users off-site. */
function safeRedirect(next: string) {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}
