"use client";

import { Pause, Play } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { Playback } from "@convex/games/playback";
import { Button } from "@/components/ui/button";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { useHostMutation } from "@/features/host/shared/useHostMutation";

// Plays or pauses the question's sound or video on the TV; the hosts' own screen stays silent.
export function PlaybackControls({ gameId, playback }: { gameId: Id<"games">; playback: Playback }) {
  const play = useHostMutation(api.games.mutations.playMedia);
  const pause = useHostMutation(api.games.mutations.pauseMedia);
  const run = useRunAction();
  const isPlaying = playback.kind === "playing";
  const Icon = isPlaying ? Pause : Play;

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card py-1.5 pr-1.5 pl-4">
      <p className="text-sm text-muted-foreground">{isPlaying ? "Klippet spelas" : "Klipp"}</p>
      <Button variant="outline" onClick={() => run(() => (isPlaying ? pause : play)({ gameId, from: playback }))}>
        <Icon aria-hidden="true" />
        {isPlaying ? "Pausa" : "Spela"}
      </Button>
    </div>
  );
}
