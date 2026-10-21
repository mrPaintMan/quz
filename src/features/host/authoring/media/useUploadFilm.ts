"use client";

import { useCallback } from "react";
import { api } from "@convex/_generated/api";
import { useHostMutation } from "@/features/host/shared/useHostMutation";

// Uploads a film from the browser straight to R2 (D32) and returns its key.
export function useUploadFilm(): (film: Blob) => Promise<string> {
  const generateFilmUploadUrl = useHostMutation(api.media.mutations.generateFilmUploadUrl);
  return useCallback(
    async (film: Blob) => {
      const { key, url } = await generateFilmUploadUrl({});
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": film.type },
        body: film,
      });
      if (!response.ok) {
        throw new Error("Uppladdningen misslyckades.");
      }
      return key;
    },
    [generateFilmUploadUrl],
  );
}
