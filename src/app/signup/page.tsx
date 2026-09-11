import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth-forms";
import { cardClass } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Create an account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/listings");

  const { role } = await searchParams;

  // Arriving from a link that already promised a side of the marketplace
  // ("Become an owner") — take it as settled and drop the Rent/List choice.
  const requestedRole = role === "owner" || role === "renter" ? role : undefined;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Join HyperStore</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {requestedRole === "owner"
          ? "Set up an owner account and put your equipment on the marketplace."
          : "One account, whichever side of the marketplace you are on."}
      </p>
      <div className={`${cardClass} mt-6 p-6`}>
        <SignupForm defaultRole={requestedRole ?? "renter"} lockRole={requestedRole !== undefined} />
      </div>
    </div>
  );
}
