import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth-forms";
import { cardClass } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/listings");

  const { next } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Sign in to manage your listings or pick up where you left off.
      </p>
      <div className={`${cardClass} mt-6 p-6`}>
        <LoginForm next={next ?? "/listings"} />
      </div>
    </div>
  );
}
