import { imageIdsOnScreen } from "@/domain/answering/imageIdsOnScreen";
import { mediaOnScreen } from "@/domain/media/mediaOnScreen";
import { describeScreen } from "@/domain/screenSequence/describeScreen";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { linkImages } from "../media/linkImages";
import { linkScreenMedia } from "../media/linkScreenMedia";
import type { Screen } from "./screen";

type RoundWithQuestions = Doc<"rounds"> & { questions: Doc<"questions">[] };

// Everything the TV draws for a screen: what it may say (describeScreen), its media, and links to
// the question's own pictures, such as image options, by their file.
export async function showScreen(ctx: QueryCtx, screen: Screen, rounds: RoundWithQuestions[]) {
  return {
    view: describeScreen(screen, rounds),
    media: await linkScreenMedia(ctx, mediaOnScreen(screen, rounds)),
    imageUrls: await linkImages(ctx, imageIdsOnScreen(screen, rounds)),
  };
}
