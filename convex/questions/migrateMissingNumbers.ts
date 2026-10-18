import { paginationOptsValidator } from "convex/server";
import { internalMutation } from "../_generated/server";
import { containsNaN } from "./containsNaN";
import { replaceNaNWithNull } from "./replaceNaNWithNull";

// One-off for D28, run once per deployment from the command line; see docs/deploy.md.
// Delete it once dev and production have both been migrated.
export const migrateMissingNumbers = internalMutation({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const { page, isDone, continueCursor } = await ctx.db.query("questions").paginate(paginationOpts);
    let fixed = 0;
    for (const question of page) {
      if (!containsNaN(question.content) && !containsNaN(question.timeLimitSeconds)) continue;
      await ctx.db.patch("questions", question._id, replaceNaNWithNull(question));
      fixed += 1;
    }
    return { fixed, isDone, continueCursor };
  },
});
