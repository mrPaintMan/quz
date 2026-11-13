import { playbackPositionMs } from "@/domain/playback/playbackPositionMs";
import { activeClueIndex } from "@/domain/questionTypes/paSparet/activeClueIndex";
import { isTrip } from "@/domain/questionTypes/paSparet/isTrip";
import type { Doc } from "../_generated/dataModel";
import type { AnswerContent } from "./answerContent";

// A trip's guess carries the clue showing when the team pulled the brake, which only the server
// decides, from where the film is now (D30, D63): sending a guess pulls the brake, and a draft
// never has one. Before the film starts the brake is worth the first clue. Other answers are
// left as they are.
export function withBrake(game: Doc<"games">, question: Doc<"questions">, content: AnswerContent, isSending: boolean, now: number): AnswerContent {
  if (content.type !== "paSparet" || !isTrip(question.content)) return content;
  if (!isSending) return { ...content, brakeClueIndex: null };
  const durationSeconds = question.media?.kind === "video" ? (question.media.durationSeconds ?? 0) : 0;
  const positionSeconds = game.playback ? playbackPositionMs(game.playback, now) / 1000 : 0;
  return { ...content, brakeClueIndex: activeClueIndex(positionSeconds, durationSeconds) };
}
