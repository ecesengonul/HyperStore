"use client";

import { useRef, useState, useTransition } from "react";

import { hintClass, labelClass, secondaryButtonClass } from "@/components/ui";
import { MAX_PHOTOS, MAX_PHOTO_BYTES, PHOTO_BUCKET } from "@/lib/constants";
import { photoUrl } from "@/lib/photos";
import { createClient } from "@/lib/supabase/client";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  return file.type === "image/png" ? "png" : "jpg";
}

/**
 * Uploads straight from the browser to Supabase Storage, into a folder named
 * after the signed-in user (which is what the storage policy allows). The
 * resulting object paths ride along with the form as hidden inputs.
 */
export function PhotoUploader({ userId }: { userId: string }) {
  const [paths, setPaths] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setError(null);

    const files = [...fileList];
    if (paths.length + files.length > MAX_PHOTOS) {
      setError(`You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }

    const supabase = createClient();
    const uploaded: string[] = [];

    for (const file of files) {
      if (!ACCEPTED.includes(file.type)) {
        setError(`${file.name} is not a JPEG, PNG, WebP or AVIF image.`);
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        setError(`${file.name} is larger than 10 MB.`);
        continue;
      }

      const path = `${userId}/${crypto.randomUUID()}.${extensionFor(file)}`;
      const { error: uploadError } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, file, { cacheControl: "3600", contentType: file.type });

      if (uploadError) {
        setError(uploadError.message);
        continue;
      }
      uploaded.push(path);
    }

    if (uploaded.length) setPaths((current) => [...current, ...uploaded]);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function remove(path: string) {
    setPaths((current) => current.filter((p) => p !== path));
    const supabase = createClient();
    await supabase.storage.from(PHOTO_BUCKET).remove([path]);
  }

  return (
    <div>
      <span className={labelClass}>Photos</span>
      <p className={hintClass}>
        Up to {MAX_PHOTOS} images, 10 MB each. The first one is used as the cover.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple
        className="sr-only"
        onChange={(event) => startTransition(() => void handleFiles(event.target.files))}
      />

      <button
        type="button"
        className={`${secondaryButtonClass} mt-2`}
        disabled={isPending || paths.length >= MAX_PHOTOS}
        onClick={() => inputRef.current?.click()}
      >
        {isPending ? "Uploading…" : paths.length ? "Add more photos" : "Upload photos"}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {paths.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-3">
          {paths.map((path, index) => (
            <li key={path} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl(path)}
                alt={`Listing photo ${index + 1}`}
                className="h-24 w-32 rounded-lg border border-line object-cover"
              />
              {index === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-medium">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => void remove(path)}
                aria-label={`Remove photo ${index + 1}`}
                className="absolute -right-2 -top-2 h-6 w-6 rounded-full border border-line bg-white text-sm leading-none text-ink-soft shadow hover:text-ink"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {paths.map((path) => (
        <input key={path} type="hidden" name="photos" value={path} />
      ))}
    </div>
  );
}
