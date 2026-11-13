"use client";

import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isHandPoints } from "@/domain/scoring/manualPoints";
import { formatPoints } from "@/domain/scoring/formatPoints";
import type { TeamColour } from "@/domain/teams/teamColours";
import { formatDecimal } from "@/domain/text/formatDecimal";
import { parseDecimal } from "@/domain/text/parseDecimal";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { useHostMutation } from "@/features/host/shared/useHostMutation";
import { useDraftText } from "@/features/shared/forms/useDraftText";
import { TeamDot } from "@/features/shared/teams/TeamDot";

type Team = { _id: Id<"teams">; name: string; colour: TeamColour };
export type HandScoringState = NonNullable<FunctionReturnType<typeof api.adjustments.queries.getHandPoints>>;

const formatGiven = (points: number | null) => (points === null ? "" : formatDecimal(points));

// One team's points: − and + step a whole point, and halves can be typed, sent when the field is
// left or Enter is pressed, so typing writes once. An empty field clears them; a number past the
// activity's most is kept in the field, marked, and not sent.
function TeamPoints({ team, points, maxPoints, onSet }: { team: Team; points: number | null; maxPoints: number | null; onSet: (points: number | null) => void }) {
  const [text, setText] = useDraftText(points, formatGiven, parseDecimal);
  const typed = parseDecimal(text);
  const isInvalid = text.trim() !== "" && (typed === null || !isHandPoints(typed, maxPoints));
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
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        onBlur={() => {
          if (text.trim() === "") {
            if (points !== null) onSet(null);
          } else if (!isInvalid && typed !== points) onSet(typed);
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

// The hosts give each team its points by hand, from 0 up to the question's most: every team on an
// activity's screen (D61), the teams that sent one on a drawing's answer screen (D62). They count at
// once; the team's phone shows them.
export function HandScoring({
  gameId,
  questionId,
  title,
  scoring,
  teams,
}: {
  gameId: Id<"games">;
  questionId: Id<"questions">;
  title: string;
  scoring: HandScoringState;
  teams: Team[];
}) {
  const setHandPoints = useHostMutation(api.adjustments.mutations.setHandPoints);
  const run = useRunAction();
  const scored = scoring.teams.flatMap(({ teamId, points }) => {
    const team = teams.find((candidate) => candidate._id === teamId);
    return team ? [{ team, points }] : [];
  });
  return (
    <section className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <h3 className="font-semibold">{title}</h3>
      {scoring.maxPoints !== null && <p className="text-sm text-muted-foreground">Högst {formatPoints(scoring.maxPoints)} per lag.</p>}
      {scored.length === 0 && <p className="text-sm text-muted-foreground">Inga svar.</p>}
      <ul className="flex flex-col">
        {scored.map(({ team, points }) => (
          <TeamPoints
            key={team._id}
            team={team}
            points={points}
            maxPoints={scoring.maxPoints}
            onSet={(next) => run(() => setHandPoints({ gameId, questionId, teamId: team._id, points: next }))}
          />
        ))}
      </ul>
    </section>
  );
}
