import type { Id } from "@convex/_generated/dataModel";
import type { Screen } from "@convex/games/screen";
import { imageIdsOnScreen } from "@/domain/answering/imageIdsOnScreen";
import { mediaOnScreen } from "./mediaOnScreen";

type Rounds = Parameters<typeof mediaOnScreen>[1] & Parameters<typeof imageIdsOnScreen>[1];

// Every picture a screen shows: its own picture or a video's still, and pictures in the question
// such as image options. The TV loads the next screen's ahead, so they show at once (D57).
export function picturesOnScreen(screen: Screen | undefined, rounds: Rounds): Id<"_storage">[] {
  if (screen === undefined) return [];
  const media = mediaOnScreen(screen, rounds);
  const own = media?.kind === "image" ? [media.storageId] : media?.kind === "video" && media.posterId ? [media.posterId] : [];
  return [...new Set([...own, ...imageIdsOnScreen(screen, rounds)])];
}
