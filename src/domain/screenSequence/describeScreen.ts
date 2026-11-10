import type { Id } from "@convex/_generated/dataModel";
import type { AnswerContent } from "@convex/answers/answerContent";
import type { Screen } from "@convex/games/screen";
import type { QuestionContent } from "@convex/questions/questionContent";
import { answeringOf, type RevealedAnswer, type ShownQuestion } from "@/domain/answering/registry";
import type { Graded } from "@/domain/answering/answeringRules";
import { rulesFor } from "@/domain/questionTypes/registry";

type QuestionInRound = { _id: Id<"questions">; prompt: string; content: QuestionContent };
type RoundInQuiz = { _id: Id<"rounds">; title: string; questions: QuestionInRound[] };

// What the TV and phones may know about a screen: never an answer before its answer screen.
export type ScreenView =
  | { kind: "lobby" }
  | { kind: "rules"; roundCount: number; questionCount: number; activityCount: number }
  | { kind: "roundIntro"; roundNumber: number; title: string }
  // `shown` is what the TV and phones show of the question; null until its type is built (M3).
  | { kind: "question"; roundNumber: number; questionNumber: number; prompt: string; answeredInApp: boolean; shown: ShownQuestion | null }
  | { kind: "answer"; roundNumber: number; questionNumber: number; prompt: string; revealed: RevealedAnswer | null }
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
// skips them. graded is the answer screen's question's sent answers and verdicts, for a type that
// reveals what the teams got right.
export function describeScreen(screen: Screen, allRounds: RoundInQuiz[], graded?: Graded<AnswerContent>): ScreenView {
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
      const { content } = question;
      const shown = answeringOf(content)?.show(content) ?? null;
      return { kind: "question", ...place, prompt: question.prompt, answeredInApp: rulesFor(content).answeredInApp, shown };
    }
    case "answer": {
      const { question, ...place } = findQuestion(rounds, screen.questionId);
      const { content } = question;
      return { kind: "answer", ...place, prompt: question.prompt, revealed: answeringOf(content)?.reveal(content, graded) ?? null };
    }
    case "film":
    case "leaderboard":
      return { kind: screen.kind, roundNumber: findRound(rounds, screen.roundId).roundNumber };
  }
}
