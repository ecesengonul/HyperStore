import { cardClass } from "@/components/ui";

/** Shown instead of a crash when the Supabase env vars are missing. */
export function SetupNotice() {
  return (
    <div className={`${cardClass} mx-auto max-w-2xl p-6`}>
      <h2 className="text-lg font-semibold">Connect HyperStore to Supabase</h2>
      <p className="mt-2 text-sm text-ink-soft">
        The app needs a Supabase project before it can show anything. Copy{" "}
        <code className="rounded bg-foam px-1">.env.example</code> to{" "}
        <code className="rounded bg-foam px-1">.env.local</code>, fill in your project URL and anon
        key, then run the SQL in{" "}
        <code className="rounded bg-foam px-1">supabase/migrations/0001_init.sql</code>. Full steps
        are in the README.
      </p>
    </div>
  );
}
