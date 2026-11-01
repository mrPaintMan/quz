"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Playback } from "@convex/games/playback";
import { playbackPositionMs } from "@/domain/playback/playbackPositionMs";

// Keeps an audio or video element where the hosts' playback says, worked out on this device's
// clock. Browsers refuse to play sound on a page nobody has clicked; then `blocked` is true, and
// calling `sync` from a click plays it.
export function usePlaybackSync<E extends HTMLMediaElement>(playback: Playback | null) {
  const ref = useRef<E>(null);
  const [blocked, setBlocked] = useState(false);

  const sync = useCallback(() => {
    const element = ref.current;
    if (element === null || playback === null) return;
    element.currentTime = playbackPositionMs(playback, Date.now()) / 1000;
    if (playback.kind === "paused") {
      element.pause();
      return;
    }
    element.play().then(
      () => setBlocked(false),
      // A clip still loading also refuses; it syncs again once loaded (onLoadedMetadata).
      (error: DOMException) => setBlocked(error.name === "NotAllowedError"),
    );
  }, [playback]);

  useEffect(sync, [sync]);
  return { ref, blocked, sync };
}
