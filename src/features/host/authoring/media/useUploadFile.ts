"use client";

import { useCallback } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useHostMutation } from "@/features/host/shared/useHostMutation";

// Uploads a file to Convex storage and returns its id (the three-step upload Convex uses).
export function useUploadFile(): (file: Blob) => Promise<Id<"_storage">> {
  const generateUploadUrl = useHostMutation(api.media.mutations.generateUploadUrl);
  return useCallback(
    async (file: Blob) => {
      const uploadUrl = await generateUploadUrl({});
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
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
