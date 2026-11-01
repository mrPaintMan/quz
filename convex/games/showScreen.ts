import { mediaOnScreen } from "@/domain/media/mediaOnScreen";
import { describeScreen } from "@/domain/screenSequence/describeScreen";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { linkScreenMedia } from "../media/linkScreenMedia";
import type { Screen } from "./screen";

type RoundWithQuestions = Doc<"rounds"> & { questions: Doc<"questions">[] };

// Everything the TV draws for a screen: what it may say (describeScreen) and its media.
export async function showScreen(ctx: QueryCtx, screen: Screen, rounds: RoundWithQuestions[]) {
  return { view: describeScreen(screen, rounds), media: await linkScreenMedia(ctx, mediaOnScreen(screen, rounds)) };
}
