"use client";

import { playbackPositionMs } from "@/domain/playback/playbackPositionMs";
import { activeClueIndex } from "@/domain/questionTypes/paSparet/activeClueIndex";
import type { FilmOnScreen } from "@/features/player/answering/AnswerInputProps";
import { useNow } from "@/features/shared/time/useNow";

// How often the phone looks where the film is.
const TICK_MS = 250;

// The active clue's index, worked out as the server stamps a brake (D63), from the playback the
// server stores and this phone's clock: the first before the film plays or while its length is
// unknown. A phone whose clock is off by seconds can show the neighbouring clue near a change; the
// server's stamp is what counts.
export function useClueIndex(film: FilmOnScreen | null): number {
  const now = useNow(TICK_MS);
  if (!film?.playback) return 0;
  return activeClueIndex(playbackPositionMs(film.playback, now) / 1000, film.durationSeconds ?? 0);
}
