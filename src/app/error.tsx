"use client";

import Link from "next/link";

import { secondaryButtonClass } from "@/components/ui";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-sm text-ink-soft">
        We could not load this page. This usually means HyperStore could not reach the database.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" onClick={reset} className={secondaryButtonClass}>
          Try again
        </button>
        <Link href="/listings" className={secondaryButtonClass}>
          Back to listings
        </Link>
      </div>
    </div>
  );
}
