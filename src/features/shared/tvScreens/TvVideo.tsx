"use client";

import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { Playback } from "@convex/games/playback";
import { SoundBlockedButton } from "./SoundBlockedButton";
import { usePlaybackSync } from "./usePlaybackSync";

type TvVideoProps = { questionId: Id<"questions">; posterUrl: string | null; playback: Playback | null };

// The film is asked for when its question shows, since its links expire (D32); its still shows
// until it plays.
export function TvVideo({ questionId, posterUrl, playback }: TvVideoProps) {
  const getFilmUrl = useMutation(api.media.mutations.getShowingFilmUrl);
  const [filmUrl, setFilmUrl] = useState<string | null>(null);
  const { ref, blocked, sync } = usePlaybackSync<HTMLVideoElement>(playback);

  useEffect(() => {
    let isCurrent = true;
    getFilmUrl({ questionId }).then((url) => {
      if (isCurrent) setFilmUrl(url);
    });
    return () => {
      isCurrent = false;
    };
  }, [getFilmUrl, questionId]);

  return (
    <div className="relative flex max-h-full min-h-0 justify-center">
      <video
        ref={ref}
        src={filmUrl ?? undefined}
        poster={posterUrl ?? undefined}
        preload="auto"
        playsInline
        onLoadedMetadata={sync}
        className="max-h-full max-w-full rounded-[1cqw] object-contain"
      />
      {blocked && <SoundBlockedButton onClick={sync} />}
    </div>
  );
}
