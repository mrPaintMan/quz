"use client";

import { useState } from "react";
import { api } from "@convex/_generated/api";
import type { VideoMedia } from "@convex/questions/table";
import { Button } from "@/components/ui/button";
import { formatClock } from "@/domain/time/formatClock";
import { useHostQuery } from "@/features/host/shared/useHostQuery";

type VideoPreviewProps = { media: VideoMedia; alt: string };

// Shows the film's still and length; the film itself is only fetched when the host presses
// play, since every download counts against Convex's free monthly egress (D30).
export function VideoPreview({ media, alt }: VideoPreviewProps) {
  const [playing, setPlaying] = useState(false);
  const stillUrl = useHostQuery(api.media.queries.getMediaUrl, media.posterId ? { storageId: media.posterId } : "skip");
  const filmUrl = useHostQuery(api.media.queries.getMediaUrl, playing ? { storageId: media.storageId } : "skip");

  if (playing && filmUrl === null) {
    return <p className="text-sm text-destructive">Filmen finns inte längre.</p>;
  }
  if (playing) {
    return filmUrl ? (
      <video controls autoPlay src={filmUrl} className="max-h-64 w-full rounded-lg" aria-label={alt} />
    ) : (
      <p className="text-sm text-muted-foreground">Hämtar filmen…</p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {stillUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Convex storage URLs are signed and change; next/image would need a remote pattern per deployment.
        <img src={stillUrl} alt={`Stillbild ur ${alt.toLowerCase()}`} className="max-h-64 rounded-lg object-contain" />
      ) : (
        media.posterId === null && <p className="text-sm text-muted-foreground">Ingen stillbild. Ladda upp filmen igen för att få en.</p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        {media.durationSeconds !== null && <span className="text-sm text-muted-foreground">Längd {formatClock(media.durationSeconds)}</span>}
        <Button variant="outline" size="sm" onClick={() => setPlaying(true)}>
          Spela upp
        </Button>
      </div>
    </div>
  );
}
