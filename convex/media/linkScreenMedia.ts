import type { ScreenMedia } from "@/domain/media/mediaOnScreen";
import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

// What the TV draws: links to a screen's picture or sound, or a video's still. The film itself is
// asked for only while its question shows (getShowingFilmUrl), as its links expire (D32).
export type ShownMedia =
  | { kind: "image"; url: string }
  | { kind: "audio"; url: string }
  | { kind: "video"; questionId: Id<"questions">; posterUrl: string | null };

// A picture or sound whose file is gone shows as no media at all.
export async function linkScreenMedia(ctx: QueryCtx, media: ScreenMedia | null): Promise<ShownMedia | null> {
  if (media === null) return null;
  if (media.kind === "video") {
    const posterUrl = media.posterId === null ? null : await ctx.storage.getUrl(media.posterId);
    return { kind: "video", questionId: media.questionId, posterUrl };
  }
  const url = await ctx.storage.getUrl(media.storageId);
  return url === null ? null : { kind: media.kind, url };
}
