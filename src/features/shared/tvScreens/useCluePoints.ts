"use client";

import { useState, type SyntheticEvent } from "react";
import { cluePointsAt } from "@/domain/questionTypes/paSparet/cluePointsAt";

type FilmState = { positionSeconds: number; durationSeconds: number; hasStarted: boolean; hasEnded: boolean };

// The points the trip's film is at, read from the video element itself so the number changes
// with the picture, whatever the TV's clock says. null before the film first plays and after it
// ends, when there is nothing to win.
export function useCluePoints() {
  const [film, setFilm] = useState<FilmState>({ positionSeconds: 0, durationSeconds: 0, hasStarted: false, hasEnded: false });
  const read = (event: SyntheticEvent<HTMLVideoElement>, change: Partial<FilmState> = {}) => {
    const { currentTime, duration } = event.currentTarget;
    setFilm((before) => ({ ...before, positionSeconds: currentTime, durationSeconds: duration, ...change }));
  };
  const points = film.hasStarted && !film.hasEnded ? cluePointsAt(film.positionSeconds, film.durationSeconds) : null;
  return {
    points,
    handlers: {
      onPlaying: (event: SyntheticEvent<HTMLVideoElement>) => read(event, { hasStarted: true, hasEnded: false }),
      onTimeUpdate: (event: SyntheticEvent<HTMLVideoElement>) => read(event),
      onEnded: (event: SyntheticEvent<HTMLVideoElement>) => read(event, { hasEnded: true }),
    },
  };
}
