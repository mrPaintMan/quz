import type { Playback } from "@convex/games/playback";
import type { ScreenMedia } from "@/domain/media/mediaOnScreen";

// A clip waits at its start until a host presses play; pictures have nothing to play.
export function playbackForMedia(media: ScreenMedia | null): Playback | undefined {
  if (media?.kind !== "audio" && media?.kind !== "video") return undefined;
  return { kind: "paused", positionMs: 0 };
}
