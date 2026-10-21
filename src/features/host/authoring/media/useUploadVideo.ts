"use client";

import { useCallback } from "react";
import type { VideoMedia } from "@convex/questions/table";
import { readVideoFacts } from "./readVideoFacts";
import { useUploadFile } from "./useUploadFile";
import { useUploadFilm } from "./useUploadFilm";

// Uploads a film to R2 and its still to Convex, with the length read from the file (D30, D31).
export function useUploadVideo(): (file: File) => Promise<VideoMedia> {
  const uploadFile = useUploadFile();
  const uploadFilm = useUploadFilm();
  return useCallback(
    async (file: File) => {
      const { still, durationSeconds } = await readVideoFacts(file);
      // A still that fails to upload is left out rather than failing the film's upload with it.
      const stillUpload = still ? uploadFile(still).catch(() => null) : null;
      const [r2Key, posterId] = await Promise.all([uploadFilm(file), stillUpload]);
      return { kind: "video", r2Key, posterId, durationSeconds };
    },
    [uploadFile, uploadFilm],
  );
}
