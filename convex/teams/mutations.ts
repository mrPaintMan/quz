import { ConvexError, v } from "convex/values";
import { findTeamProblems } from "@/domain/teams/findTeamProblems";
import { mutation } from "../_generated/server";
import { getOrThrow } from "../shared/getOrThrow";
import { teamColour } from "./table";
import { teamsOfGame } from "./teamsOfGame";

// Public: teams join with no account (D3). Joining stays open after the start, so a late
// team can still play the questions left.
export const joinGame = mutation({
  args: { gameId: v.id("games"), name: v.string(), colour: teamColour },
  handler: async (ctx, { gameId, name, colour }) => {
    const game = await getOrThrow(ctx, "games", gameId);
    if (game.endedAt !== null) {
      throw new ConvexError("Quizet är slut.");
    }
    const [problem] = findTeamProblems({ name, colour }, await teamsOfGame(ctx, gameId));
    if (problem !== undefined) {
      throw new ConvexError(problem.message);
    }
    return ctx.db.insert("teams", { gameId, name: name.trim(), colour });
  },
});
