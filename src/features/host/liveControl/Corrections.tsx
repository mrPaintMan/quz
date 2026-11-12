"use client";

import { useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isCorrection } from "@/domain/scoring/manualPoints";
import { formatPoints } from "@/domain/scoring/formatPoints";
import type { TeamColour } from "@/domain/teams/teamColours";
import { parseDecimal } from "@/domain/text/parseDecimal";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { useHostMutation } from "@/features/host/shared/useHostMutation";
import { useHostQuery } from "@/features/host/shared/useHostQuery";
import { TeamDot } from "@/features/shared/teams/TeamDot";

type Team = { _id: Id<"teams">; name: string; colour: TeamColour };

const signed = (points: number) => (points > 0 ? `+${formatPoints(points)}` : formatPoints(points));

// For mistakes made during the night: the hosts add or take away a team's points at any time, and
// can take a correction back (D61). No reason is asked for.
export function Corrections({ gameId, teams }: { gameId: Id<"games">; teams: Team[] }) {
  const corrections = useHostQuery(api.adjustments.queries.listCorrections, { gameId });
  const addCorrection = useHostMutation(api.adjustments.mutations.addCorrection);
  const removeCorrection = useHostMutation(api.adjustments.mutations.removeCorrection);
  const run = useRunAction();
  const [chosenTeamId, setTeamId] = useState<Id<"teams"> | null>(null);
  const [text, setText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  if (teams.length === 0) return null;
  const teamId = teams.find((team) => team._id === chosenTeamId)?._id ?? teams[0]._id;
  const points = parseDecimal(text);
  const canAdd = !isAdding && points !== null && isCorrection(points);
  const teamOf = (id: Id<"teams">) => teams.find((team) => team._id === id);

  return (
    <section className="flex flex-col gap-2 rounded-xl border bg-card p-4">
      <h2 className="font-semibold">Rätta poäng</h2>
      <p className="text-sm text-muted-foreground">Lägg till eller dra av poäng om något blev fel.</p>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!canAdd) return;
          setIsAdding(true);
          run(async () => {
            try {
              await addCorrection({ gameId, teamId, points });
              setText("");
            } finally {
              setIsAdding(false);
            }
          });
        }}
      >
        <select
          aria-label="Lag"
          value={teamId}
          onChange={(event) => setTeamId(event.target.value as Id<"teams">)}
          className="h-8 min-w-0 flex-1 rounded-lg border bg-background pl-2.5 pr-8 text-sm"
        >
          {teams.map((team) => (
            <option key={team._id} value={team._id}>
              {team.name}
            </option>
          ))}
        </select>
        <Input aria-label="Poäng" inputMode="decimal" placeholder="2 eller -1" className="w-24" value={text} onChange={(event) => setText(event.target.value)} />
        <Button type="submit" size="sm" disabled={!canAdd}>
          Lägg till
        </Button>
      </form>
      {corrections && corrections.length > 0 && (
        <ul className="flex flex-col">
          {corrections.map((correction) => {
            const team = teamOf(correction.teamId);
            return (
              <li key={correction._id} className="flex items-center gap-2 border-t py-1.5 first:border-t-0">
                {team && <TeamDot colour={team.colour} />}
                <span className="min-w-0 flex-1 truncate">{team?.name ?? "Okänt lag"}</span>
                <span className="font-semibold tabular-nums">{signed(correction.points)}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Ta bort rättelsen för ${team?.name ?? "laget"}`}
                  onClick={() => run(() => removeCorrection({ gameId, adjustmentId: correction._id }))}
                >
                  ✕
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
