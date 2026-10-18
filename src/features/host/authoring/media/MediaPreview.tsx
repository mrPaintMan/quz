"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useHostQuery } from "@/features/host/shared/useHostQuery";
import type { MediaKind } from "@convex/questions/table";

type MediaPreviewProps = { storageId: Id<"_storage">; kind: MediaKind; alt: string };

export function MediaPreview({ storageId, kind, alt }: MediaPreviewProps) {
  const url = useHostQuery(api.media.queries.getMediaUrl, { storageId });
  if (url === undefined) {
    return <p className="text-sm text-muted-foreground">Hämtar fil…</p>;
  }
  if (url === null) {
    return <p className="text-sm text-destructive">Filen finns inte längre.</p>;
  }
  if (kind === "audio") {
    return <audio controls src={url} className="w-full" aria-label={alt} />;
  }
  if (kind === "video") {
    return <video controls src={url} className="max-h-64 w-full rounded-lg" aria-label={alt} />;
  }
  // eslint-disable-next-line @next/next/no-img-element -- Convex storage URLs are signed and change; next/image would need a remote pattern per deployment.
  return <img src={url} alt={alt} className="max-h-64 rounded-lg object-contain" />;
}
