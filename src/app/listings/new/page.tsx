import Link from "next/link";
import { redirect } from "next/navigation";

import { ListingForm } from "@/components/listing-form";
import { SetupNotice } from "@/components/setup-notice";
import { cardClass } from "@/components/ui";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata = { title: "List your equipment" };

export default async function NewListingPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="px-4 py-12">
        <SetupNotice />
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/listings/new");

  if (!isOwner(user)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className={`${cardClass} p-6`}>
          <h1 className="text-lg font-semibold">This is an owner feature</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Your account is set up for renting. Owner accounts are the ones that publish equipment —
            create one to list your gear.
          </p>
          <Link
            href="/signup?role=owner"
            className="mt-4 inline-block text-sm font-medium text-sea hover:underline"
          >
            Create an owner account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">List your equipment</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Renters see this in the feed straight away. You can delete it any time from your dashboard.
      </p>
      <div className={`${cardClass} mt-6 p-6`}>
        <ListingForm userId={user.id} />
      </div>
    </div>
  );
}
