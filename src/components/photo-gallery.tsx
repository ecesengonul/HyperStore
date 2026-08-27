"use client";

import { useState } from "react";

import { photoUrl } from "@/lib/photos";

export function PhotoGallery({ photos, title }: { photos: string[]; title: string }) {
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-xl border border-line bg-foam text-sm text-ink-soft">
        No photos yet
      </div>
    );
  }

  const current = photos[Math.min(active, photos.length - 1)];

  return (
    <div className="space-y-3">
      <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border border-line bg-foam">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl(current)}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>

      {photos.length > 1 && (
        <ul className="flex flex-wrap gap-2">
          {photos.map((photo, index) => (
            <li key={photo}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show photo ${index + 1} of ${photos.length}`}
                aria-current={index === active}
                className={`h-16 w-20 overflow-hidden rounded-lg border transition ${
                  index === active ? "border-sea ring-2 ring-sea/30" : "border-line hover:border-sea"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl(photo)}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
