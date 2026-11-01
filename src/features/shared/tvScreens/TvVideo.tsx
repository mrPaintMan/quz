"use client";

import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "@convex/_generated/api";
import type { Playback } from "@convex/games/playback";
import type { Screen } from "@convex/games/screen";
import { CluePointsOverlay } from "./CluePointsOverlay";
import { SoundBlockedButton } from "./SoundBlockedButton";
import { useCluePoints } from "./useCluePoints";
import { usePlaybackSync } from "./usePlaybackSync";

type TvVideoProps = { screen: Screen; posterUrl: string | null; playback: Playback | null; showsCluePoints: boolean };

// The film is asked for when its screen shows, since its links expire (D32); its still shows
// until it plays. The trip's film has its points in the corner.
export function TvVideo({ screen, posterUrl, playback, showsCluePoints }: TvVideoProps) {
  const getFilmUrl = useMutation(api.media.mutations.getShowingFilmUrl);
  const [filmUrl, setFilmUrl] = useState<string | null>(null);
  const { ref, blocked, sync } = usePlaybackSync<HTMLVideoElement>(playback);
  const { points, handlers } = useCluePoints();
  // Every game update hands out a new but equal screen; ask for the film only once per screen.
  const screenKey = JSON.stringify(screen);

  useEffect(() => {
    let isCurrent = true;
    getFilmUrl({ screen: JSON.parse(screenKey) as Screen }).then((url) => {
      if (isCurrent) setFilmUrl(url);
    });
    return () => {
      isCurrent = false;
    };
  }, [getFilmUrl, screenKey]);

  return (
    <div className="relative flex max-h-full min-h-0 justify-center @container">
      <video
        ref={ref}
        src={filmUrl ?? undefined}
        poster={posterUrl ?? undefined}
        preload="auto"
        playsInline
        onLoadedMetadata={sync}
        {...(showsCluePoints ? handlers : {})}
        className="max-h-full max-w-full rounded-[1cqw] object-contain"
      />
      {showsCluePoints && <CluePointsOverlay points={points} />}
      {blocked && <SoundBlockedButton onClick={sync} />}
    </div>
  );
}
