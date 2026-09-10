/** Shared form/control classes so every screen looks like the same product. */
export const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-sea focus:outline-none focus:ring-2 focus:ring-sea/30";

export const labelClass = "block text-sm font-medium text-ink";

export const hintClass = "mt-1 text-xs text-ink-soft";

export const primaryButtonClass =
  "inline-flex items-center justify-center rounded-lg bg-sea px-4 py-2 text-sm font-medium text-white transition " +
  "hover:bg-sea-dark active:bg-sea-deep active:scale-[0.98] motion-reduce:transform-none " +
  "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-sea disabled:active:scale-100";

export const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition " +
  "hover:border-sea/40 hover:bg-foam active:bg-line active:scale-[0.98] motion-reduce:transform-none " +
  "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white disabled:active:scale-100";

export const cardClass = "rounded-xl border border-line bg-white";

/** Pill-shaped call to action used in the header. */
export const pillButtonClass =
  "inline-flex items-center justify-center rounded-full bg-sea px-4 py-2 font-medium text-white transition " +
  "hover:bg-sea-dark active:bg-sea-deep active:scale-[0.98] motion-reduce:transform-none";

/** Plain text link in the header nav. */
export const navLinkClass = "text-ink-soft transition hover:text-ink active:text-sea";
