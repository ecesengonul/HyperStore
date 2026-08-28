import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import { getCurrentUser, isOwner } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const owner = isOwner(user);
  const name = user?.profile?.full_name || user?.email || "Account";

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight text-ink">
          Hyper<span className="text-sea">Store</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/listings" className="text-ink-soft hover:text-ink">
            Browse
          </Link>
          {owner && (
            <Link href="/dashboard" className="text-ink-soft hover:text-ink">
              My listings
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3 text-sm">
          {user ? (
            <>
              {owner && (
                <Link
                  href="/listings/new"
                  className="rounded-full bg-sea px-4 py-2 font-medium text-white hover:bg-sea-dark"
                >
                  List equipment
                </Link>
              )}
              <span className="hidden text-ink-soft sm:inline" title={user.email ?? undefined}>
                {name}
              </span>
              <form action={signOut}>
                <button type="submit" className="text-ink-soft hover:text-ink">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-ink-soft hover:text-ink">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-sea px-4 py-2 font-medium text-white hover:bg-sea-dark"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
