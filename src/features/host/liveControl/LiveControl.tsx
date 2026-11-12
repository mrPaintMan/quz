"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { HostHeader } from "@/features/host/shared/HostHeader";
import { useHostMutation } from "@/features/host/shared/useHostMutation";
import { useHostQuery } from "@/features/host/shared/useHostQuery";
import { useAnsweredTeamIds } from "@/features/shared/answers/useAnsweredTeamIds";
import { useScores } from "@/features/shared/scores/useScores";
import { TvScreen } from "@/features/shared/tvScreens/TvScreen";
import { useJoinUrl } from "@/features/shared/tvScreens/useJoinUrl";
import { ActivityScoring } from "./ActivityScoring";
import { AnswerStatusList } from "./AnswerStatusList";
import { Corrections } from "./Corrections";
import { EndGameButton } from "./EndGameButton";
import { PlaybackControls } from "./PlaybackControls";
import { QuestionNotes } from "./QuestionNotes";
import { ReviewList, type Review } from "./ReviewList";
import { ScoreBoard } from "./ScoreBoard";
import { ScoringRules } from "./ScoringRules";
import { screenLabel } from "./screenLabel";
import { TimerControls } from "./TimerControls";
import { TripClueLine } from "./TripClueLine";
import { TvPreview } from "./TvPreview";
import type { RunningGame } from "@/features/shared/game/RunningGame";


// Why Nästa waits, while the question's answers are being judged (D55); null when it doesn't.
function nextWaitsFor(review: Review | null | undefined): string | null {
  if (review?.phase === "judging") return "Nästa väntar på AI:n…";
  if (review?.phase !== "reviewing") return null;
  return `Nästa väntar tills alla svar är bedömda (${review.unjudged} kvar).`;
}

// The hosts' view of the night: what the TV shows now and what comes next, both drawn as the TV
// draws them but silent, with the controls for stepping on and for the question's timer and clip.
export function LiveControl({ game }: { game: RunningGame }) {
  const teams = useQuery(api.teams.queries.listTeams, { gameId: game._id }) ?? [];
  const next = useHostQuery(api.games.queries.getNextScreen, { gameId: game._id });
  const joinUrl = useJoinUrl();
  const answeredTeamIds = useAnsweredTeamIds(game._id, game.screen);
  const scores = useScores(game._id);
  const goToNext = useHostMutation(api.games.mutations.goToNextScreen);
  const goToPrevious = useHostMutation(api.games.mutations.goToPreviousScreen);
  const questionOnScreen = game.screen.kind === "question" || game.screen.kind === "answer" ? game.screen.questionId : null;
  const review = useHostQuery(api.verdicts.queries.getReview, questionOnScreen ? { gameId: game._id, questionId: questionOnScreen } : "skip");
  const run = useRunAction();
  const gameId = game._id;
  const waitingFor = nextWaitsFor(review);
  // Until the question's judging state has loaded, Nästa can't tell whether it must wait.
  const isLoadingJudging = questionOnScreen !== null && review === undefined;
  const notes = next?.notes;
  // The address is null only while rendering on the server, and the game loads only in the
  // browser, so this never shows.
  if (joinUrl === null) return null;
  const screenProps = { quizTitle: game.quizTitle, teams, scores, joinUrl };

  return (
    <div className="flex min-h-svh flex-col">
      <HostHeader actions={<EndGameButton gameId={gameId} />}>
        <h1 className="text-lg font-semibold">{game.quizTitle}</h1>
        <a href="/tv" target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
          Öppna TV-vyn
        </a>
      </HostHeader>
      <main className="mx-auto grid w-full max-w-6xl items-start gap-6 px-4 py-6 lg:grid-cols-[2fr_1fr]">
        <section className="flex flex-col gap-3">
          <h2 className="text-sm text-muted-foreground">Visas på TV:n nu</h2>
          <TvPreview>
            <TvScreen
              view={game.view}
              media={game.media}
              imageUrls={game.imageUrls}
              answeredCount={answeredTeamIds?.length ?? null}
              timer={game.timer}
              playback={game.playback}
              silent
              {...screenProps}
            />
          </TvPreview>
          <p role="status" className="text-lg font-semibold">
            {screenLabel(game.view)}
          </p>
          {game.media?.kind === "video" && game.media.showsCluePoints && game.playback && (
            <TripClueLine gameId={gameId} playback={game.playback} />
          )}
          {game.view.kind === "question" && game.view.shown && answeredTeamIds && (
            <AnswerStatusList teams={teams} answeredTeamIds={answeredTeamIds} />
          )}
          {notes?.current?.scoring && <ScoringRules {...notes.current.scoring} />}
          {/* The next screen's notes cover the same question while it moves to its answer; a new
              question's notes start folded. */}
          {notes?.current && notes.current.questionId !== notes.next?.questionId && (
            <QuestionNotes key={notes.current.questionId} notes={notes.current.notes} folded />
          )}
          {game.view.kind === "question" && !game.view.answeredInApp && questionOnScreen && (
            <ActivityScoring gameId={gameId} questionId={questionOnScreen} teams={teams} />
          )}
          {review && questionOnScreen && <ReviewList gameId={gameId} questionId={questionOnScreen} review={review} />}
          {waitingFor && (
            <p role="status" className="text-right text-sm text-primary">
              {waitingFor}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {game.timer && <TimerControls gameId={gameId} timer={game.timer} />}
            {game.playback && <PlaybackControls gameId={gameId} playback={game.playback} />}
            <div className="ml-auto flex gap-3">
              <Button variant="outline" size="lg" onClick={() => run(() => goToPrevious({ gameId, from: game.screen }))}>
                Föregående
              </Button>
              {next === null ? (
                <EndGameButton gameId={gameId} size="lg" variant="default" />
              ) : (
                <Button size="lg" disabled={waitingFor !== null || isLoadingJudging} onClick={() => run(() => goToNext({ gameId, from: game.screen }))}>
                  Nästa
                </Button>
              )}
            </div>
          </div>
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="text-sm text-muted-foreground">Nästa på TV:n</h2>
          {next === null && <p className="text-muted-foreground">Inget mer efter detta.</p>}
          {next && (
            <>
              <TvPreview>
                <TvScreen
                  view={next.view}
                  media={next.media}
                  imageUrls={next.imageUrls}
                  answeredCount={null}
                  timer={null}
                  playback={null}
                  silent
                  {...screenProps}
                />
              </TvPreview>
              <p className="font-semibold">{screenLabel(next.view)}</p>
              {notes?.next && <QuestionNotes notes={notes.next.notes} />}
            </>
          )}
          {scores && <ScoreBoard scores={scores} />}
          <Corrections gameId={gameId} teams={teams} />
        </section>
      </main>
    </div>
  );
}
