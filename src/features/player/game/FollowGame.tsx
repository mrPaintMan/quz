"use client";

import type { Timer } from "@convex/games/timer";
import type { ScreenView } from "@/domain/screenSequence/describeScreen";
import type { TeamColour } from "@/domain/teams/teamColours";
import { TeamDot } from "@/features/shared/teams/TeamDot";
import { timeLeftText } from "@/features/shared/timer/timeLeftText";
import { useSecondsLeft } from "@/features/shared/timer/useSecondsLeft";
import { phoneScreenText } from "./phoneScreenText";

type FollowGameProps = { team: { name: string; colour: TeamColour }; view: ScreenView; timer: Timer | null };

// The team's phone during the game: it follows the TV by itself, so there is nothing to press.
export function FollowGame({ team, view, timer }: FollowGameProps) {
  const secondsLeft = useSecondsLeft(timer);
  return (
    <main className="flex min-h-svh flex-col gap-8 p-5">
      <header className="flex items-center gap-2 font-semibold">
        <TeamDot colour={team.colour} />
        {team.name}
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <p role="status" className="text-2xl">
          {phoneScreenText(view)}
        </p>
        {secondsLeft !== null && (
          <p role="timer" className="text-4xl font-bold text-primary tabular-nums">
            {timeLeftText(secondsLeft)}
          </p>
        )}
      </div>
    </main>
  );
}
