"use client";

import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export type TeamScore = FunctionReturnType<typeof api.scores.queries.getScores>[number];

// The teams ranked by score (D6); undefined while loading, or when `enabled` is false, so a
// screen that doesn't show scores doesn't follow them.
export function useScores(gameId: Id<"games">, enabled = true): TeamScore[] | undefined {
  return useQuery(api.scores.queries.getScores, enabled ? { gameId } : "skip");
}
