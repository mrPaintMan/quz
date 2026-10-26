import type { Id } from "@convex/_generated/dataModel";
import type { Screen } from "@convex/games/screen";
import type { QuestionContent } from "@convex/questions/questionContent";
import { rulesFor } from "@/domain/questionTypes/registry";

type QuestionInRound = { _id: Id<"questions">; prompt: string; content: QuestionContent };
type RoundInQuiz = { _id: Id<"rounds">; title: string; questions: QuestionInRound[] };

// What the TV and phones may know about a screen: never an answer before its answer screen.
export type ScreenView =
  | { kind: "lobby" }
  | { kind: "rules"; roundCount: number; questionCount: number; activityCount: number }
  | { kind: "roundIntro"; roundNumber: number; title: string }
  | { kind: "question"; roundNumber: number; questionNumber: number; prompt: string; answeredInApp: boolean }
  | { kind: "answer"; roundNumber: number; questionNumber: number; prompt: string }
  | { kind: "film"; roundNumber: number }
  | { kind: "leaderboard"; roundNumber: number }
  | { kind: "finalLeaderboard" };

function describeRules(rounds: RoundInQuiz[]): ScreenView {
  const questions = rounds.flatMap((round) => round.questions);
  return {
    kind: "rules",
    roundCount: rounds.length,
    questionCount: questions.length,
    activityCount: questions.filter((question) => !rulesFor(question.content).answeredInApp).length,
  };
}

function findQuestion(rounds: RoundInQuiz[], questionId: Id<"questions">) {
  for (const [roundIndex, round] of rounds.entries()) {
    const questionIndex = round.questions.findIndex((question) => question._id === questionId);
    if (questionIndex !== -1) {
      return { roundNumber: roundIndex + 1, questionNumber: questionIndex + 1, question: round.questions[questionIndex] };
    }
  }
  throw new Error(`Question ${questionId} is not in the quiz.`);
}

function findRound(rounds: RoundInQuiz[], roundId: Id<"rounds">) {
  const index = rounds.findIndex((round) => round._id === roundId);
  if (index === -1) throw new Error(`Round ${roundId} is not in the quiz.`);
  return { roundNumber: index + 1, round: rounds[index] };
}

// Describes a screen of the sequence built from the same rounds (buildScreenSequence), so every
// round and question it names is there. Rounds without questions aren't counted, as the night
// skips them.
export function describeScreen(screen: Screen, allRounds: RoundInQuiz[]): ScreenView {
  const rounds = allRounds.filter((round) => round.questions.length > 0);
  switch (screen.kind) {
    case "lobby":
    case "finalLeaderboard":
      return { kind: screen.kind };
    case "rules":
      return describeRules(rounds);
    case "roundIntro": {
      const { roundNumber, round } = findRound(rounds, screen.roundId);
      return { kind: "roundIntro", roundNumber, title: round.title };
    }
    case "question": {
      const { question, ...place } = findQuestion(rounds, screen.questionId);
      return { kind: "question", ...place, prompt: question.prompt, answeredInApp: rulesFor(question.content).answeredInApp };
    }
    case "answer": {
      const { question, ...place } = findQuestion(rounds, screen.questionId);
      return { kind: "answer", ...place, prompt: question.prompt };
    }
    case "film":
    case "leaderboard":
      return { kind: screen.kind, roundNumber: findRound(rounds, screen.roundId).roundNumber };
  }
}
