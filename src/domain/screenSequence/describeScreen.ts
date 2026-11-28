import type { Id } from "@convex/_generated/dataModel";
import type { AnswerContent } from "@convex/answers/answerContent";
import type { Screen } from "@convex/games/screen";
import type { QuestionContent } from "@convex/questions/questionContent";
import type { Film } from "@convex/rounds/table";
import { answeringOf, type RevealedAnswer, type ShownQuestion } from "@/domain/answering/registry";
import type { Graded } from "@/domain/answering/answeringRules";
import { isTrip } from "@/domain/questionTypes/paSparet/isTrip";
import { filmsOf } from "@/domain/rounds/filmOf";
import { rulesFor } from "@/domain/questionTypes/registry";

type QuestionInRound = { _id: Id<"questions">; prompt: string; description?: string; filmId?: string; content: QuestionContent };
type RoundInQuiz = { _id: Id<"rounds">; title: string; films?: Film[]; questions: QuestionInRound[] };

// What the TV and phones may know about a screen: never an answer before its answer screen.
export type ScreenView =
  | { kind: "lobby" }
  | { kind: "rules"; roundCount: number; questionCount: number; activityCount: number }
  | { kind: "roundIntro"; roundNumber: number; title: string }
  // `shown` is what the TV and phones show of the question; null until its type is built (M3).
  // isTrip marks På spåret's trip, which goes by "På spåret" rather than its round and number (D66).
  // description is the question's own short text under its prompt, empty for none (D68).
  // filmNumber is the place in its round of the film a question is asked after, whose questions
  // are then numbered from 1 (D74); null for a question that doesn't follow a film.
  | { kind: "question"; roundNumber: number; filmNumber: number | null; questionNumber: number; prompt: string; description: string; answeredInApp: boolean; isTrip: boolean; shown: ShownQuestion | null }
  | { kind: "answer"; roundNumber: number; filmNumber: number | null; questionNumber: number; prompt: string; description: string; isTrip: boolean; revealed: RevealedAnswer | null }
  | { kind: "film"; roundNumber: number; filmNumber: number }
  | { kind: "leaderboard"; roundNumber: number }
  | { kind: "finalLeaderboard" };

// A question's description as shown, trimmed; empty for none.
const descriptionOf = (question: QuestionInRound) => question.description?.trim() ?? "";

function describeRules(rounds: RoundInQuiz[]): ScreenView {
  const questions = rounds.flatMap((round) => round.questions);
  return {
    kind: "rules",
    roundCount: rounds.length,
    questionCount: questions.length,
    activityCount: questions.filter((question) => !rulesFor(question.content).answeredInApp).length,
  };
}

// A film's place among its round's films, from 1.
const filmNumberOf = (round: RoundInQuiz, filmId: string) => filmsOf(round).findIndex((film) => film.id === filmId) + 1;

// A question's place: its round's number and its number among the round's questions answered in
// the app, as activities go by "Aktivitet" and take no number of their own (D54); an activity
// carries the number of the questions before it, unused. A question asked after a film is
// numbered among that film's questions instead, with the film's number (D74).
function findQuestion(rounds: RoundInQuiz[], questionId: Id<"questions">) {
  for (const [roundIndex, round] of rounds.entries()) {
    const questionIndex = round.questions.findIndex((question) => question._id === questionId);
    if (questionIndex !== -1) {
      const question = round.questions[questionIndex];
      const { filmId } = question;
      const counted = round.questions.slice(0, questionIndex + 1).filter((candidate) => candidate.filmId === filmId && rulesFor(candidate.content).answeredInApp);
      const filmNumber = filmId === undefined ? null : filmNumberOf(round, filmId);
      return { roundNumber: roundIndex + 1, filmNumber, questionNumber: counted.length, question };
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
      return { kind: "question", ...place, prompt: question.prompt, description: descriptionOf(question), answeredInApp: rulesFor(content).answeredInApp, isTrip: isTrip(content), shown };
    }
    case "answer": {
      const { question, ...place } = findQuestion(rounds, screen.questionId);
      const { content } = question;
      return { kind: "answer", ...place, prompt: question.prompt, description: descriptionOf(question), isTrip: isTrip(content), revealed: answeringOf(content)?.reveal(content, graded) ?? null };
    }
    case "film": {
      const { roundNumber, round } = findRound(rounds, screen.roundId);
      return { kind: "film", roundNumber, filmNumber: filmNumberOf(round, screen.filmId) };
    }
    case "leaderboard":
      return { kind: "leaderboard", roundNumber: findRound(rounds, screen.roundId).roundNumber };
  }
}
