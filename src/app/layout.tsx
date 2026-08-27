import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";

import "./globals.css";

// The header renders the signed-in user, which means reading auth cookies on
// every route — nothing below this layout can be prerendered at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "HyperStore — rent sea toys & equipment in Turkey",
    template: "%s · HyperStore",
  },
  description:
    "Rent foils, jetskis, sea scooters, catamarans and small boats from local owners along the Turkish coast.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line bg-foam">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-8 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} HyperStore</p>
            <p>Sea toys &amp; equipment, 1–10 m. Launching in Turkey.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
