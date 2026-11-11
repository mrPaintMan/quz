"use client";

import { useCallback } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useHostMutation } from "@/features/host/shared/useHostMutation";
import { shrinkImage } from "./shrinkImage";

// Uploads a file to Convex storage and returns its id (the three-step upload Convex uses). Images
// are shrunk first, so the TV can show them at once (D57).
export function useUploadFile(): (file: Blob) => Promise<Id<"_storage">> {
  const generateUploadUrl = useHostMutation(api.media.mutations.generateUploadUrl);
  return useCallback(
    async (file: Blob) => {
      const body = await shrinkImage(file);
      const uploadUrl = await generateUploadUrl({});
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": body.type },
        body,
      });
      if (!response.ok) {
        throw new Error("Uppladdningen misslyckades.");
      }
      const { storageId } = (await response.json()) as { storageId: Id<"_storage"> };
      return storageId;
    },
    [generateUploadUrl],
  );
}
