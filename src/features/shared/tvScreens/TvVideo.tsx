"use client";

import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "@convex/_generated/api";
import type { Playback } from "@convex/games/playback";
import type { Screen } from "@convex/games/screen";
import { CluePointsOverlay } from "./CluePointsOverlay";
import { FilmFrame } from "./FilmFrame";
import { usePreloadedFilm } from "./preloadedFilms";
import { SoundBlockedButton } from "./SoundBlockedButton";
import { useCluePoints } from "./useCluePoints";
import { usePlaybackSync } from "./usePlaybackSync";

// Most films are 16:9; the real shape is read from the film once it loads.
const WIDESCREEN = 16 / 9;

type TvVideoProps = { screen: Screen; posterUrl: string | null; playback: Playback | null; showsCluePoints: boolean };

// Plays the film the TV downloaded ahead when it was ready as the screen showed (D73); otherwise
// the film is asked for now, since its links expire (D32), and streams. Its still shows until it
// plays. The trip's film has its points in the corner.
export function TvVideo({ screen, posterUrl, playback, showsCluePoints }: TvVideoProps) {
  const getFilmUrl = useMutation(api.media.mutations.getShowingFilmUrl);
  // Only what was ready as the screen showed: switching to it mid-film would start the film over.
  const preloaded = usePreloadedFilm(screen);
  const [preloadedUrl] = useState(preloaded);
  const [filmUrl, setFilmUrl] = useState<string | null>(preloadedUrl);
  const [aspectRatio, setAspectRatio] = useState(WIDESCREEN);
  const { ref, blocked, sync } = usePlaybackSync<HTMLVideoElement>(playback);
  const { points, handlers } = useCluePoints();
  // Every game update hands out a new but equal screen; ask for the film only once per screen.
  const screenKey = JSON.stringify(screen);

  useEffect(() => {
    if (preloadedUrl !== null) return;
    let isCurrent = true;
    getFilmUrl({ screen: JSON.parse(screenKey) as Screen }).then((url) => {
      if (isCurrent) setFilmUrl(url);
    });
    return () => {
      isCurrent = false;
    };
  }, [getFilmUrl, preloadedUrl, screenKey]);

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
