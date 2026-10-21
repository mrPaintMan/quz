"use client";

import { useState } from "react";
import { api } from "@convex/_generated/api";
import type { VideoMedia } from "@convex/questions/table";
import { Button } from "@/components/ui/button";
import { formatClock } from "@/domain/time/formatClock";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { useHostMutation } from "@/features/host/shared/useHostMutation";
import { useHostQuery } from "@/features/host/shared/useHostQuery";

type VideoPreviewProps = { media: VideoMedia; alt: string };

// Shows the film's still and length, and asks for a link to the film itself only when the
// host presses play, so opening a question never downloads it (D30, D31).
export function VideoPreview({ media, alt }: VideoPreviewProps) {
  const [filmUrl, setFilmUrl] = useState<string | null>(null);
  const [unplayable, setUnplayable] = useState(false);
  const getFilmUrl = useHostMutation(api.media.mutations.getFilmUrl);
  const run = useRunAction();
  const stillUrl = useHostQuery(api.media.queries.getMediaUrl, media.posterId ? { storageId: media.posterId } : "skip");

  if (unplayable) {
    return <p className="text-sm text-destructive">Filmen kunde inte spelas. Ladda upp den igen.</p>;
  }
  if (filmUrl) {
    return (
      <video controls autoPlay src={filmUrl} onError={() => setUnplayable(true)} className="max-h-64 w-full rounded-lg" aria-label={alt} />
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {stillUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Convex storage URLs are signed and change; next/image would need a remote pattern per deployment.
        <img src={stillUrl} alt={`Stillbild ur ${alt.toLowerCase()}`} className="max-h-64 rounded-lg object-contain" />
      ) : (
        // No still was made, or it is gone; while its URL is on its way (undefined) show nothing.
        (media.posterId === null || stillUrl === null) && <p className="text-sm text-muted-foreground">Ingen stillbild. Ladda upp filmen igen för att få en.</p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        {media.durationSeconds !== null && <span className="text-sm text-muted-foreground">Längd {formatClock(media.durationSeconds)}</span>}
        <Button variant="outline" size="sm" onClick={() => run(async () => setFilmUrl(await getFilmUrl({ r2Key: media.r2Key })))}>
          Spela upp
        </Button>
      </div>
    </div>
  );
}
