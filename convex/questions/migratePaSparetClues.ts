import { paginationOptsValidator } from "convex/server";
import { internalMutation } from "../_generated/server";
import { toFiveClueTexts } from "@/domain/questionTypes/paSparet/toFiveClueTexts";

// One-off for D30, run once per deployment from the command line; see docs/deploy.md.
// Delete it, clueText and the legacy clue shape once dev and production have both run it.
export const migratePaSparetClues = internalMutation({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const { page, isDone, continueCursor } = await ctx.db.query("questions").paginate(paginationOpts);
    let fixed = 0;
    for (const { _id, content } of page) {
      if (content.type !== "paSparet") continue;
      const clues = toFiveClueTexts(content.clues);
      if (JSON.stringify(clues) === JSON.stringify(content.clues)) continue;
      await ctx.db.patch("questions", _id, { content: { ...content, clues } });
      fixed += 1;
    }
    return { fixed, isDone, continueCursor };
  },
});
