"use client";

import { Music } from "lucide-react";
import type { Playback } from "@convex/games/playback";
import { SoundBlockedButton } from "./SoundBlockedButton";
import { usePlaybackSync } from "./usePlaybackSync";

// A sound clip has nothing to look at, so the TV shows that one is playing, or waiting.
export function TvAudio({ url, playback }: { url: string; playback: Playback | null }) {
  const { ref, blocked, sync } = usePlaybackSync<HTMLAudioElement>(playback);
  const isPlaying = playback?.kind === "playing";
  return (
    <div className="relative flex flex-col items-center gap-[1.4cqw] text-muted-foreground">
      <Music aria-hidden="true" className={`size-[10cqw] ${isPlaying ? "animate-pulse text-primary" : ""}`} />
      <p className="text-[2.2cqw]">{isPlaying ? "Lyssna!" : "Ljudklipp"}</p>
      <audio ref={ref} src={url} preload="auto" onLoadedMetadata={sync} />
      {blocked && <SoundBlockedButton onClick={sync} />}
    </div>
  );
}
