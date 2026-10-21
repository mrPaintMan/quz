import { defineTable } from "convex/server";
import { v } from "convex/values";
import { TEAM_COLOURS } from "@/domain/teams/teamColours";

export const teamColour = v.union(...TEAM_COLOURS.map((colour) => v.literal(colour)));

// The phone keeps its team's id, so it can rejoin after a refresh (D3).
export const teamsTable = defineTable({
  gameId: v.id("games"),
  name: v.string(),
  colour: teamColour,
}).index("by_gameId", ["gameId"]);
