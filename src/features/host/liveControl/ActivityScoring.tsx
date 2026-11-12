"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isActivityPoints } from "@/domain/scoring/manualPoints";
import { formatPoints } from "@/domain/scoring/formatPoints";
import type { TeamColour } from "@/domain/teams/teamColours";
import { formatDecimal } from "@/domain/text/formatDecimal";
import { parseDecimal } from "@/domain/text/parseDecimal";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { useHostMutation } from "@/features/host/shared/useHostMutation";
import { useHostQuery } from "@/features/host/shared/useHostQuery";
import { useDraftText } from "@/features/shared/forms/useDraftText";
import { TeamDot } from "@/features/shared/teams/TeamDot";

type Team = { _id: Id<"teams">; name: string; colour: TeamColour };

const formatGiven = (points: number | null) => (points === null ? "" : formatDecimal(points));

// One team's points: − and + step a whole point, and halves can be typed. An empty field clears
// them; a number past the activity's most is kept in the field, marked, and not sent.
function TeamPoints({ team, points, maxPoints, onSet }: { team: Team; points: number | null; maxPoints: number | null; onSet: (points: number | null) => void }) {
  const [text, setText] = useDraftText(points, formatGiven, parseDecimal);
  const typed = parseDecimal(text);
  const isInvalid = text.trim() !== "" && (typed === null || !isActivityPoints(typed, maxPoints));
  const now = points ?? 0;
  const atMost = (value: number) => (maxPoints === null ? value : Math.min(value, maxPoints));
  return (
    <li className="flex items-center gap-2 border-t py-1.5 first:border-t-0">
      <TeamDot colour={team.colour} />
      <span className="min-w-0 flex-1 truncate">{team.name}</span>
      <Button size="sm" variant="outline" aria-label={`Minus för ${team.name}`} disabled={now <= 0} onClick={() => onSet(Math.max(now - 1, 0))}>
        −
      </Button>
      <Input
        aria-label={`Poäng för ${team.name}`}
        inputMode="decimal"
        className="w-16 text-center tabular-nums"
        value={text}
        aria-invalid={isInvalid}
        onChange={(event) => {
          setText(event.target.value);
          const value = parseDecimal(event.target.value);
          if (event.target.value.trim() === "") onSet(null);
          else if (value !== null && isActivityPoints(value, maxPoints)) onSet(value);
        }}
      />
      <Button
        size="sm"
        variant="outline"
        aria-label={`Plus för ${team.name}`}
        disabled={maxPoints !== null && now >= maxPoints}
        onClick={() => onSet(atMost(points === null ? 1 : now + 1))}
      >
        +
      </Button>
    </li>
  );
}

// On an activity's screen, the hosts give each team its points, from 0 up to the activity's most
// (D61). They count at once and show on the team's phone; Nästa doesn't wait for them.
export function ActivityScoring({ gameId, questionId, teams }: { gameId: Id<"games">; questionId: Id<"questions">; teams: Team[] }) {
  const activity = useHostQuery(api.adjustments.queries.getActivityPoints, { gameId, questionId });
  const setActivityPoints = useHostMutation(api.adjustments.mutations.setActivityPoints);
  const run = useRunAction();
  if (!activity || teams.length === 0) return null;
  const pointsOf = (teamId: Id<"teams">) => activity.teams.find((given) => given.teamId === teamId)?.points ?? null;
  return (
    <section className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <h3 className="font-semibold">Poäng för aktiviteten</h3>
      {activity.maxPoints !== null && <p className="text-sm text-muted-foreground">Högst {formatPoints(activity.maxPoints)} per lag.</p>}
      <ul className="flex flex-col">
        {teams.map((team) => (
          <TeamPoints
            key={team._id}
            team={team}
            points={pointsOf(team._id)}
            maxPoints={activity.maxPoints}
            onSet={(points) => run(() => setActivityPoints({ gameId, questionId, teamId: team._id, points }))}
          />
        ))}
      </ul>
    </section>
  );
}
