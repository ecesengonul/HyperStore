"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { signIn, signUp, type AuthFormState } from "@/app/auth/actions";
import { hintClass, inputClass, labelClass, primaryButtonClass } from "@/components/ui";

const initialState: AuthFormState = {};

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${primaryButtonClass} w-full`}>
      {pending ? "Please wait…" : children}
    </button>
  );
}

function Feedback({ state }: { state: AuthFormState }) {
  if (state.error) {
    return (
      <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
        {state.error}
      </p>
    );
  }
  if (state.notice) {
    return (
      <p role="status" className="rounded-lg bg-foam px-3 py-2 text-sm text-ink">
        {state.notice}
      </p>
    );
  }
  return null;
}

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Feedback state={state} />

      <div>
        <label className={labelClass} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>

      <SubmitButton>Sign in</SubmitButton>

      <p className={hintClass}>
        New to HyperStore?{" "}
        <Link href="/signup" className="font-medium text-sea hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignupForm({
  defaultRole,
  lockRole = false,
}: {
  defaultRole: "renter" | "owner";
  /** Came from a link that already picked a side — don't ask again. */
  lockRole?: boolean;
}) {
  const [state, formAction] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <Feedback state={state} />

      {lockRole ? (
        <>
          <input type="hidden" name="role" value={defaultRole} />
          <p className={hintClass}>
            {defaultRole === "owner"
              ? "Creating an owner account, so you can list equipment."
              : "Creating a renter account."}{" "}
            <Link href="/signup" className="font-medium text-sea hover:underline">
              Change
            </Link>
          </p>
        </>
      ) : (
        <fieldset className="space-y-2">
          <legend className={labelClass}>I want to…</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <RoleOption
              value="renter"
              defaultRole={defaultRole}
              title="Rent"
              description="Browse and rent sea toys near me."
            />
            <RoleOption
              value="owner"
              defaultRole={defaultRole}
              title="List my equipment"
              description="Put my gear on the marketplace."
            />
          </div>
        </fieldset>
      )}

      <div>
        <label className={labelClass} htmlFor="full_name">
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          required
          className={inputClass}
          placeholder="Deniz Yılmaz"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
        />
        <p className={hintClass}>At least 8 characters.</p>
      </div>

      <SubmitButton>Create account</SubmitButton>

      <p className={hintClass}>
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-sea hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

function RoleOption({
  value,
  defaultRole,
  title,
  description,
}: {
  value: "renter" | "owner";
  defaultRole: "renter" | "owner";
  title: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-lg border border-line p-3 transition hover:border-sea has-[:checked]:border-sea has-[:checked]:bg-foam">
      <input
        type="radio"
        name="role"
        value={value}
        defaultChecked={defaultRole === value}
        className="mt-1 accent-[var(--color-sea)]"
      />
      <span>
        <span className="block text-sm font-medium text-ink">{title}</span>
        <span className="block text-xs text-ink-soft">{description}</span>
      </span>
    </label>
  );
}
