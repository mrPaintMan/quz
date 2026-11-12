"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { formatPoints } from "@/domain/scoring/formatPoints";

// On an activity's screen, the team's points once the hosts have given them (D61).
export function ActivityPoints({ teamId }: { teamId: Id<"teams"> }) {
  const points = useQuery(api.adjustments.queries.getTeamActivityPoints, { teamId });
  if (points === undefined || points === null) return null;
  return <p className="text-xl font-semibold text-primary">Ni fick {formatPoints(points)} för aktiviteten.</p>;
}
