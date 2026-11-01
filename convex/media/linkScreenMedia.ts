import type { ScreenMedia } from "@/domain/media/mediaOnScreen";
import type { QueryCtx } from "../_generated/server";
import type { Screen } from "../games/screen";

// What the TV draws: links to a screen's picture or sound, or a video's still. The film itself is
// asked for only while its screen shows (getShowingFilmUrl), as its links expire (D32).
export type ShownMedia =
  | { kind: "image"; url: string }
  | { kind: "audio"; url: string }
  | { kind: "video"; screen: Screen; posterUrl: string | null; showsCluePoints: boolean };

// A picture or sound whose file is gone shows as no media at all.
export async function linkScreenMedia(ctx: QueryCtx, media: ScreenMedia | null): Promise<ShownMedia | null> {
  if (media === null) return null;
  if (media.kind === "video") {
    const posterUrl = media.posterId === null ? null : await ctx.storage.getUrl(media.posterId);
    return { kind: "video", screen: media.screen, posterUrl, showsCluePoints: media.showsCluePoints };
  }
  const url = await ctx.storage.getUrl(media.storageId);
  return url === null ? null : { kind: media.kind, url };
}
