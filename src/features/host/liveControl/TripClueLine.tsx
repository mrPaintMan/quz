"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { Playback } from "@convex/games/playback";
import { playbackPositionMs } from "@/domain/playback/playbackPositionMs";
import { clueProgress } from "@/domain/questionTypes/paSparet/clueProgress";
import { PA_SPARET_CLUE_POINTS } from "@/domain/questionTypes/paSparet/paSparetRules";
import { formatClock } from "@/domain/time/formatClock";
import { useHostQuery } from "@/features/host/shared/useHostQuery";
import { useNow } from "@/features/shared/time/useNow";

// The trip's active clue for the hosts, following the film as the TV's points do, so they know
// where the room is without reading the TV.
export function TripClueLine({ gameId, playback }: { gameId: Id<"games">; playback: Playback }) {
  const trip = useHostQuery(api.games.queries.getShowingTrip, { gameId });
  const now = useNow(250);
  if (!trip) return null;
  if (trip.durationSeconds === null) {
    return <p className="text-sm text-muted-foreground">Filmens längd är okänd, så ledtrådarna kan inte följas.</p>;
  }
  const progress = clueProgress(playbackPositionMs(playback, now) / 1000, trip.durationSeconds);
  if (progress.hasEnded) return <p className="text-sm text-muted-foreground">Filmen är slut.</p>;
  const next = progress.secondsToNext === null ? "sista ledtråden" : `nästa om ${formatClock(Math.ceil(progress.secondsToNext))}`;

  return (
    <section className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <p className="font-semibold">
        Ledtråd {progress.index + 1} av {PA_SPARET_CLUE_POINTS.length} · {progress.points} poäng · {next}
      </p>
      <p className="text-muted-foreground">{trip.clues[progress.index]}</p>
    </section>
  );
}
