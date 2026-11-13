"use client";

import { playbackPositionMs } from "@/domain/playback/playbackPositionMs";
import { clueProgress } from "@/domain/questionTypes/paSparet/clueProgress";
import { PA_SPARET_CLUE_POINTS } from "@/domain/questionTypes/paSparet/paSparetRules";
import type { FilmOnScreen } from "@/features/player/answering/AnswerInputProps";
import { useNow } from "@/features/shared/time/useNow";

// How often the phone looks where the film is.
const TICK_MS = 250;

// The active clue's index, from where the film is on the server's clock; the first before it plays
// or while its length is unknown, as the server counts a brake then (D63).
export function useClueIndex(film: FilmOnScreen | null): number {
  const now = useNow(TICK_MS);
  if (!film?.playback) return 0;
  return clueProgress(playbackPositionMs(film.playback, now) / 1000, film.durationSeconds ?? 0).index;
}

const stopClass = (index: number, active: number) => {
  if (index === active) return "size-10 bg-primary text-base text-primary-foreground";
  if (index < active) return "size-7 bg-secondary text-xs text-muted-foreground line-through";
  return "size-7 border bg-card text-xs text-muted-foreground";
};

// What a brake is worth now, large, over the five stops 10, 8, 6, 4, 2: the one now lit, those
// passed struck out, following the film on the TV (D63).
export function CluePointsCard({ index }: { index: number }) {
  const points = PA_SPARET_CLUE_POINTS[index];
  const label = index === 0 ? "Första ledtråden" : `Ledtråd ${index + 1} av ${PA_SPARET_CLUE_POINTS.length}`;
  return (
    <section aria-label="Poäng just nu" className="rounded-2xl border bg-card px-4 py-3.5">
      <p className="text-sm text-muted-foreground">{label} · drar ni nu får ni</p>
      <p aria-live="polite" className="text-5xl leading-tight font-bold text-primary">
        {points} poäng
      </p>
      <ol aria-hidden="true" className="mt-3 flex items-center">
        {PA_SPARET_CLUE_POINTS.map((stop, stopIndex) => (
          <li key={stop} className={`flex items-center ${stopIndex === 0 ? "" : "flex-1"}`}>
            {stopIndex > 0 && <span className={`h-0.5 flex-1 ${stopIndex <= index ? "bg-primary/45" : "bg-border"}`} />}
            <span className={`flex shrink-0 items-center justify-center rounded-full font-bold ${stopClass(stopIndex, index)}`}>{stop}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
