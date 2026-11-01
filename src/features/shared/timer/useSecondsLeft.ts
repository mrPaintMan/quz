"use client";

import { useSyncExternalStore } from "react";
import type { Timer } from "@convex/games/timer";
import { secondsLeft } from "@/domain/timer/secondsLeft";

// Ticks a few times a second, so the clock turns over close to the full second.
const TICK_MS = 200;

function subscribeToTicks(onTick: () => void) {
  const interval = setInterval(onTick, TICK_MS);
  return () => clearInterval(interval);
}

const noSubscription = () => () => {};

// The whole seconds left on the timer, counted on this device's clock; null without a timer or
// while rendering on the server. The value only changes once a second, so most ticks don't
// re-render.
export function useSecondsLeft(timer: Timer | null): number | null {
  return useSyncExternalStore(
    timer?.kind === "running" ? subscribeToTicks : noSubscription,
    () => (timer === null ? null : secondsLeft(timer, Date.now())),
    () => null,
  );
}
