"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { Timer } from "@convex/games/timer";
import { Button } from "@/components/ui/button";
import { TIMER_EXTENSION_SECONDS } from "@/domain/timer/extendTimer";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { useHostMutation } from "@/features/host/shared/useHostMutation";
import { timeLeftText } from "@/features/shared/timer/timeLeftText";
import { useSecondsLeft } from "@/features/shared/timer/useSecondsLeft";

// The hosts' hold on the question's countdown: the time left, pause or resume, and more time.
export function TimerControls({ gameId, timer }: { gameId: Id<"games">; timer: Timer }) {
  const pause = useHostMutation(api.games.mutations.pauseGameTimer);
  const resume = useHostMutation(api.games.mutations.resumeGameTimer);
  const extend = useHostMutation(api.games.mutations.extendGameTimer);
  const run = useRunAction();
  const secondsLeft = useSecondsLeft(timer);
  const isRunning = timer.kind === "running";

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card py-1.5 pr-1.5 pl-4">
      <p role="timer" className="min-w-14 text-2xl font-bold text-primary tabular-nums">
        {secondsLeft !== null && timeLeftText(secondsLeft)}
      </p>
      <Button variant="outline" onClick={() => run(() => (isRunning ? pause : resume)({ gameId }))}>
        {isRunning ? "Pausa" : "Fortsätt"}
      </Button>
      <Button variant="outline" onClick={() => run(() => extend({ gameId }))}>
        +{TIMER_EXTENSION_SECONDS} s
      </Button>
    </div>
  );
}
