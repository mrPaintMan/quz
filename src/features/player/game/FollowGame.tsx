"use client";

import type { Id } from "@convex/_generated/dataModel";
import type { Screen } from "@convex/games/screen";
import type { Timer } from "@convex/games/timer";
import type { ScreenView } from "@/domain/screenSequence/describeScreen";
import { formatPoints } from "@/domain/scoring/formatPoints";
import type { TeamColour } from "@/domain/teams/teamColours";
import { AnswerQuestion } from "@/features/player/answering/AnswerQuestion";
import { QuestionResult } from "@/features/player/results/QuestionResult";
import type { ImageUrls } from "@/features/shared/questionDisplays/QuestionDisplayProps";
import { TeamDot } from "@/features/shared/teams/TeamDot";
import { timeLeftText } from "@/features/shared/timer/timeLeftText";
import { useSecondsLeft } from "@/features/shared/timer/useSecondsLeft";
import { phoneScreenText } from "./phoneScreenText";

type FollowGameProps = {
  team: { _id: Id<"teams">; name: string; colour: TeamColour };
  // The team's own score so far; null while it loads.
  points: number | null;
  screen: Screen;
  view: ScreenView;
  imageUrls: ImageUrls;
  timer: Timer | null;
  isQuestionClosed: boolean;
};

// The team's phone during the game: it follows the TV by itself, shows the answer input while a
// question its type can be answered in the app is open on the TV, and after its answer is shown
// the team's own answer with what scored lit up, in place of the usual line (D58, D59).
export function FollowGame({ team, points, screen, view, imageUrls, timer, isQuestionClosed }: FollowGameProps) {
  const secondsLeft = useSecondsLeft(timer);
  const shown = view.kind === "question" ? view.shown : null;
  const isAnswering = shown !== null && screen.kind === "question" && !isQuestionClosed;
  const clock = secondsLeft !== null && (
    <p role="timer" className={`font-bold text-primary tabular-nums ${isAnswering ? "text-xl" : "text-4xl"}`}>
      {timeLeftText(secondsLeft)}
    </p>
  );

  return (
    <main className="flex min-h-svh flex-col gap-6 p-5">
      <header className="flex items-center gap-2 font-semibold">
        <TeamDot colour={team.colour} />
        <span className="min-w-0 flex-1 truncate">{team.name}</span>
        {points !== null && <span className="text-primary tabular-nums">{formatPoints(points)}</span>}
      </header>
      {isAnswering ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <p role="status" className="text-muted-foreground">
              {phoneScreenText(view)}
            </p>
            {clock}
          </div>
          <AnswerQuestion
            key={screen.questionId}
            teamId={team._id}
            questionId={screen.questionId}
            shown={shown}
            imageUrls={imageUrls}
            secondsLeft={secondsLeft}
          />
        </>
      ) : (
        <QuestionResult
          teamId={team._id}
          otherwise={
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <p role="status" className="text-2xl">
                {phoneScreenText(view)}
              </p>
              {clock}
            </div>
          }
        />
      )}
    </main>
  );
}
