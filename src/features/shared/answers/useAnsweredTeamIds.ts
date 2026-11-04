"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { Screen } from "@convex/games/screen";

// The teams that have sent their answer to the question showing; null on other screens and
// while loading. The TV counts them, the hosts see who.
export function useAnsweredTeamIds(gameId: Id<"games">, screen: Screen): Id<"teams">[] | null {
  const questionId = screen.kind === "question" ? screen.questionId : null;
  return useQuery(api.answers.queries.getAnsweredTeamIds, questionId === null ? "skip" : { gameId, questionId }) ?? null;
}
