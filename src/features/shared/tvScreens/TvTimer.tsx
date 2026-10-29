"use client";

import type { Timer } from "@convex/games/timer";
import { timeLeftText } from "@/features/shared/timer/timeLeftText";
import { useSecondsLeft } from "@/features/shared/timer/useSecondsLeft";

// The question's countdown, large in the TV's top corner.
export function TvTimer({ timer }: { timer: Timer | null }) {
  const secondsLeft = useSecondsLeft(timer);
  if (secondsLeft === null) return null;
  return (
    <p role="timer" className="shrink-0 text-[4cqw] leading-none font-bold text-primary tabular-nums">
      {timeLeftText(secondsLeft)}
    </p>
  );
}
