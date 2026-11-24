"use client";

import type { FunctionReturnType } from "convex/server";
import { Check } from "lucide-react";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Target } from "@/domain/review/typedReview";
import { formatPoints } from "@/domain/scoring/formatPoints";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { useHostMutation } from "@/features/host/shared/useHostMutation";
import { useHostQuery } from "@/features/host/shared/useHostQuery";
import { TeamDot } from "@/features/shared/teams/TeamDot";
import { VerdictChoices } from "./VerdictChoices";

type AllAnswersState = NonNullable<FunctionReturnType<typeof api.verdicts.queries.getAllAnswers>>;
type TeamAnswers = AllAnswersState["teams"][number];

const isPending = (team: TeamAnswers) => team.texts.some((text) => !text.isJudged);

// Teams with a text still waiting for a verdict first, then the rest as the leaderboard ranks them;
// worked out once as the window opens, so no block moves under a host's finger while judging.
export function orderTeams(teams: TeamAnswers[], leaderboard: string[]): TeamAnswers[] {
  const place = (teamId: string) => {
    const index = leaderboard.indexOf(teamId);
    return index === -1 ? leaderboard.length : index;
  };
  return [...teams].sort((a, b) => Number(isPending(b)) - Number(isPending(a)) || place(a.teamId) - place(b.teamId));
}

// The other teams that wrote the same text in the same slot, as one verdict counts for all of them.
function othersWith(teams: TeamAnswers[], self: TeamAnswers, slot: number, text: string): string[] {
  return teams.filter((team) => team.teamId !== self.teamId && team.texts.some((other) => other.slot === slot && other.text === text)).map((team) => team.name);
}

function TeamBlock({ team, teams, all, onJudge }: { team: TeamAnswers; teams: TeamAnswers[]; all: AllAnswersState; onJudge: (slot: number, text: string, target: Target) => void }) {
  return (
    <section aria-label={team.name} className="flex flex-col rounded-xl border bg-card px-4 py-3">
      <header className="mb-1 flex items-center gap-2 font-semibold">
        <TeamDot colour={team.colour} />
        <span className="min-w-0 flex-1 truncate">{team.name}</span>
        {isPending(team) ? (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-normal text-muted-foreground">Bedöms…</span>
        ) : (
          <span className={team.points > 0 ? "text-primary" : "text-muted-foreground"}>{formatPoints(team.points)}</span>
        )}
      </header>
      {!team.hasAnswered && <p className="py-1.5 text-sm text-muted-foreground">Svarade inte.</p>}
      <ul className="flex flex-col">
        {team.texts.map((text) => {
          const slot = all.slots[text.slot];
          const others = othersWith(teams, team, text.slot, text.text);
          return (
            <li key={`${text.slot}:${text.text}`} className="flex flex-wrap items-center gap-2 border-t py-2 first:border-t-0">
              <span className="min-w-28 flex-1 break-words">
                {all.slots.length > 1 && slot.title !== "" && <span className="text-muted-foreground">{slot.title} · </span>}
                {text.written}
                {text.byAi && (
                  <span title="Bedömt av AI" className="ml-2 rounded bg-secondary px-1.5 py-0.5 align-middle text-xs font-normal text-muted-foreground">
                    AI
                  </span>
                )}
                {/* Another form of an item the team already has scores nothing (D53). */}
                {text.result === "repeat" && <span className="block text-xs text-muted-foreground">Räknas redan</span>}
              </span>
              {/* A text the key spells always counts, so it has nothing to judge (D72). */}
              {text.isExact ? (
                <span className="flex items-center gap-1 px-1 text-sm font-semibold text-primary">
                  <Check aria-hidden className="size-4" />
                  Rätt
                </span>
              ) : (
                <>
                  <VerdictChoices slot={slot} item={text} onChoose={(target) => onJudge(text.slot, text.text, target)} />
                  {others.length > 0 && <p className="w-full text-xs text-muted-foreground">Gäller även {others.join(", ")}</p>}
                </>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// A team's place in the order fixed as the window opened; one not in it goes last.
function rank(order: string[] | null, teamId: string): number {
  const index = order?.indexOf(teamId) ?? -1;
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

// The accepted answers to compare with: one question's, or each sub-question's by its title.
function keyLine(slots: AllAnswersState["slots"]): string {
  const keyed = slots.filter((slot) => slot.options.length > 0);
  if (keyed.length === 0) return "";
  const answers = keyed.map((slot) => (slots.length > 1 && slot.title !== "" ? `${slot.title} ${slot.options.join(", ")}` : slot.options.join(", ")));
  return `Facit: ${answers.join(" · ")} · `;
}

type AllAnswersProps = {
  gameId: Id<"games">;
  questionId: Id<"questions">;
  prompt: string;
  unjudged: number;
  // The teams' ids in leaderboard order, to order the blocks by.
  leaderboard: string[];
};

// Every team's answers to a typed question, to see who got what and to change a verdict, the AI's
// included (D65): a block per team with Rätt / Fel on every judged or waiting text, a fixed "Rätt" on
// one the key spells (D72), the AI's verdicts marked, and "Bedöms…" while a text waits. Read only
// while open.
export function AllAnswers({ gameId, questionId, prompt, unjudged, leaderboard }: AllAnswersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const all = useHostQuery(api.verdicts.queries.getAllAnswers, isOpen ? { gameId, questionId } : "skip");
  const judge = useHostMutation(api.verdicts.mutations.judgeText);
  const run = useRunAction();
  const [order, setOrder] = useState<string[] | null>(null);
  const answered = all?.teams.filter((team) => team.hasAnswered).length ?? 0;
  const key = all ? keyLine(all.slots) : "";
  // The order is fixed when the answers first load; a team that joins later goes last.
  if (all && order === null) setOrder(orderTeams(all.teams, leaderboard).map((team) => team.teamId));
  const shown = all ? [...all.teams].sort((a, b) => rank(order, a.teamId) - rank(order, b.teamId)) : [];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setOrder(null);
      }}
    >
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        Visa alla svar
      </Button>
      <DialogContent className="max-w-4xl">
        <header className="flex items-start gap-4 border-b px-6 py-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-sm text-muted-foreground">Alla svar</p>
            <DialogTitle>{prompt}</DialogTitle>
            {all && (
              <DialogDescription>
                {key}
                {answered} lag svarade{unjudged > 0 ? `, ${unjudged} svar kvar att granska` : ""}
              </DialogDescription>
            )}
          </div>
          <DialogClose render={<Button variant="outline">Stäng ✕</Button>} />
        </header>
        <div className="grid gap-3 overflow-y-auto p-6 sm:grid-cols-2">
          {all === undefined && <p className="text-muted-foreground">Hämtar svaren…</p>}
          {all &&
            shown.map((team) => (
              <TeamBlock
                key={team.teamId}
                team={team}
                teams={all.teams}
                all={all}
                onJudge={(slot, text, target) => run(() => judge({ gameId, questionId, slot, text, target }))}
              />
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
