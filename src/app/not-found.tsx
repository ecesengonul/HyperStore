import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Nothing here</h1>
      <p className="mt-2 text-sm text-ink-soft">
        That page or listing does not exist — it may have been taken down by its owner.
      </p>
      <Link href="/listings" className="mt-6 inline-block font-medium text-sea transition hover:underline active:text-sea-deep">
        Browse all listings
      </Link>
    </div>
  );
}
