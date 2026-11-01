"use client";

import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "@convex/_generated/api";
import type { Playback } from "@convex/games/playback";
import type { Screen } from "@convex/games/screen";
import { CluePointsOverlay } from "./CluePointsOverlay";
import { FilmFrame } from "./FilmFrame";
import { SoundBlockedButton } from "./SoundBlockedButton";
import { useCluePoints } from "./useCluePoints";
import { usePlaybackSync } from "./usePlaybackSync";

// Most films are 16:9; the real shape is read from the film once it loads.
const WIDESCREEN = 16 / 9;

type TvVideoProps = { screen: Screen; posterUrl: string | null; playback: Playback | null; showsCluePoints: boolean };

// The film is asked for when its screen shows, since its links expire (D32); its still shows
// until it plays. The trip's film has its points in the corner.
export function TvVideo({ screen, posterUrl, playback, showsCluePoints }: TvVideoProps) {
  const getFilmUrl = useMutation(api.media.mutations.getShowingFilmUrl);
  const [filmUrl, setFilmUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState(WIDESCREEN);
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
    <FilmFrame aspectRatio={aspectRatio}>
      <video
        ref={ref}
        src={filmUrl ?? undefined}
        poster={posterUrl ?? undefined}
        preload="auto"
        playsInline
        onLoadedMetadata={(event) => {
          const { videoWidth, videoHeight } = event.currentTarget;
          if (videoWidth > 0 && videoHeight > 0) setAspectRatio(videoWidth / videoHeight);
          sync();
        }}
        {...(showsCluePoints ? handlers : {})}
        className="size-full rounded-[1cqw] object-contain"
      />
      {showsCluePoints && <CluePointsOverlay points={points} />}
      {blocked && <SoundBlockedButton onClick={sync} />}
    </FilmFrame>
  );
}
