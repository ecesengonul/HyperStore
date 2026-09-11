import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import { navLinkClass, pillButtonClass } from "@/components/ui";
import { getCurrentUser, isOwner } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const owner = isOwner(user);
  const name = user?.profile?.full_name || user?.email || "Account";

  return (
    // select-none: chrome shouldn't highlight like body text when you drag
    // across the page. The account name opts back in so it stays copyable.
    <header className="sticky top-0 z-20 select-none border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-ink transition hover:text-sea active:text-sea-deep"
        >
          Hyper<span className="text-sea">Store</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/listings" className={navLinkClass}>
            Browse
          </Link>
          {owner && (
            <Link href="/dashboard" className={navLinkClass}>
              My listings
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3 text-sm">
          {user ? (
            <>
              {owner ? (
                <Link href="/listings/new" className={pillButtonClass}>
                  List equipment
                </Link>
              ) : (
                // Renters can't publish, but the owner side shouldn't be
                // invisible — this page explains it and offers the switch.
                <Link href="/listings/new" className={navLinkClass}>
                  Become an owner
                </Link>
              )}
              <span
                className="hidden select-text text-ink-soft sm:inline"
                title={user.email ?? undefined}
              >
                {name}
              </span>
              <form action={signOut}>
                <button type="submit" className={navLinkClass}>
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={navLinkClass}>
                Sign in
              </Link>
              <Link href="/signup" className={pillButtonClass}>
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
