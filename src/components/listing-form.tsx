"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createListing, type ListingFormState } from "@/app/listings/actions";
import { PhotoUploader } from "@/components/photo-uploader";
import { hintClass, inputClass, labelClass, primaryButtonClass } from "@/components/ui";
import { CATEGORIES, MAX_SIZE_M, MIN_SIZE_M, SUGGESTED_LOCATIONS } from "@/lib/constants";

const initialState: ListingFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={primaryButtonClass}>
      {pending ? "Publishing…" : "Publish listing"}
    </button>
  );
}

export function ListingForm({ userId }: { userId: string }) {
  const [state, formAction] = useActionState(createListing, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label className={labelClass} htmlFor="title">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={3}
          maxLength={120}
          className={inputClass}
          placeholder="Yamaha VX Cruiser jetski"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="category">
            Category
          </label>
          <select id="category" name="category" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Choose a category
            </option>
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="size_m">
            Size (metres)
          </label>
          <input
            id="size_m"
            name="size_m"
            type="number"
            required
            step={0.1}
            min={MIN_SIZE_M}
            max={MAX_SIZE_M}
            inputMode="decimal"
            className={inputClass}
            placeholder="3.3"
          />
          <p className={hintClass}>
            Length overall, between {MIN_SIZE_M} and {MAX_SIZE_M} m.
          </p>
        </div>

        <div>
          <label className={labelClass} htmlFor="location">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            required
            list="hyperstore-locations"
            className={inputClass}
            placeholder="Bodrum"
          />
          <datalist id="hyperstore-locations">
            {SUGGESTED_LOCATIONS.map((location) => (
              <option key={location} value={location} />
            ))}
          </datalist>
          <p className={hintClass}>Town or marina where renters pick it up.</p>
        </div>

        <div>
          <label className={labelClass} htmlFor="hourly_price">
            Hourly price (₺)
          </label>
          <input
            id="hourly_price"
            name="hourly_price"
            type="number"
            required
            min={0}
            step={50}
            inputMode="numeric"
            className={inputClass}
            placeholder="2500"
          />
          <p className={hintClass}>What one hour of rental costs, in Turkish lira.</p>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          maxLength={4000}
          className={inputClass}
          placeholder="Condition, what is included, licence requirements, minimum rental time…"
        />
      </div>

      <PhotoUploader userId={userId} />

      <SubmitButton />
    </form>
  );
}
