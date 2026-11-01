"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Playback } from "@convex/games/playback";
import { playbackPositionMs } from "@/domain/playback/playbackPositionMs";

// Keeps an audio or video element where the hosts' playback says. Browsers refuse to play sound
// on a page nobody has clicked; then `blocked` is true, and calling `sync` from a click plays it.
export function usePlaybackSync<E extends HTMLMediaElement>(playback: Playback | null) {
  const ref = useRef<E>(null);
  const [blocked, setBlocked] = useState(false);
  // Where this TV last paused: playing on from there doesn't depend on the TV's clock, which may
  // be seconds off and would cut the start of a clip. The clock is used only to catch up with a
  // clip already playing, such as after a reload.
  const pausedAtMs = useRef<number | null>(null);
  // Every game update hands out a new but equal playback; only a real change may seek the clip.
  const key = JSON.stringify(playback);
  const current = useMemo(() => JSON.parse(key) as Playback | null, [key]);

  const sync = useCallback(() => {
    const element = ref.current;
    if (element === null || current === null) return;
    if (current.kind === "paused") {
      element.pause();
      element.currentTime = current.positionMs / 1000;
      pausedAtMs.current = current.positionMs;
      return;
    }
    element.currentTime = (pausedAtMs.current ?? playbackPositionMs(current, Date.now())) / 1000;
    element.play().then(
      () => {
        pausedAtMs.current = null;
        setBlocked(false);
      },
      // A clip still loading also refuses; it syncs again once loaded (onLoadedMetadata).
      (error: DOMException) => setBlocked(error.name === "NotAllowedError"),
    );
  }, [current]);

  useEffect(sync, [sync]);
  // A refusal no longer matters once the hosts have paused.
  return { ref, blocked: blocked && current?.kind === "playing", sync };
}
