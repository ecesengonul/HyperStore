import Link from "next/link";

import { primaryButtonClass, secondaryButtonClass } from "@/components/ui";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { CATEGORIES } from "@/lib/constants";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div>
      <section className="border-b border-line bg-foam">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-sea">
            Turkish coast · 1–10 metres
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Rent the sea toys you actually want
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-soft">
            Foils, jetskis, sea scooters, catamarans, small boats and extreme sports gear — listed
            by the people who own them, priced by the hour.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/listings" className={primaryButtonClass}>
              Browse listings
            </Link>
            <Link
              href={user ? (isOwner(user) ? "/listings/new" : "/listings") : "/signup?role=owner"}
              className={secondaryButtonClass}
            >
              {isOwner(user) ? "List your equipment" : "Become an owner"}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-xl font-semibold tracking-tight">Browse by category</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <li key={category.value}>
              <Link
                href={`/listings?category=${category.value}`}
                className="flex h-full items-center gap-3 rounded-xl border border-line p-4 transition hover:-translate-y-0.5 hover:border-sea hover:shadow active:translate-y-0 active:border-sea active:bg-foam motion-reduce:transform-none"
              >
                <span aria-hidden className="text-2xl">
                  {category.emoji}
                </span>
                <span className="font-medium">{category.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line bg-foam">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3">
          <Step
            step="1"
            title="Find it nearby"
            body="Filter the feed by category, location and hourly price until you land on the right kit."
          />
          <Step
            step="2"
            title="See the details"
            body="Photos, size, exact location and what the owner includes — all on one page."
          />
          <Step
            step="3"
            title="Owners stay in control"
            body="Publish a listing in a couple of minutes and take it down whenever you like."
          />
        </div>
      </section>
    </div>
  );
}

function Step({ step, title, body }: { step: string; title: string; body: string }) {
  return (
    <div>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sea text-sm font-semibold text-white">
        {step}
      </span>
      <h3 className="mt-3 font-medium">{title}</h3>
      <p className="mt-1 text-sm text-ink-soft">{body}</p>
    </div>
  );
}
