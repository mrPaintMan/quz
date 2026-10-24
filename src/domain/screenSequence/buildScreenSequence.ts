import type { Id } from "@convex/_generated/dataModel";
import type { Screen } from "@convex/games/screen";
import type { QuestionContent } from "@convex/questions/questionContent";
import { rulesFor } from "@/domain/questionTypes/registry";

type QuestionInRound = { _id: Id<"questions">; content: QuestionContent; filmId?: string };
type RoundInQuiz = { _id: Id<"rounds">; questions: QuestionInRound[] };

function questionScreens(question: QuestionInRound): Screen[] {
  const shown: Screen = { kind: "question", questionId: question._id };
  return rulesFor(question.content).hasAnswerScreen ? [shown, { kind: "answer", questionId: question._id }] : [shown];
}

// A film plays before the first of its questions; the server keeps them together (D33).
function roundBody(round: RoundInQuiz): Screen[] {
  return round.questions.flatMap((question, index) => {
    const { filmId } = question;
    const startsFilm = filmId !== undefined && filmId !== round.questions[index - 1]?.filmId;
    const film: Screen[] = startsFilm ? [{ kind: "film", roundId: round._id, filmId }] : [];
    return [...film, ...questionScreens(question)];
  });
}

// The night's screens in order, from the quiz's rounds and questions in order (D15, D35).
// Rounds without questions are left out; the last round ends with the final leaderboard
// instead of its own.
export function buildScreenSequence(rounds: RoundInQuiz[]): Screen[] {
  const played = rounds.filter((round) => round.questions.length > 0);
  const roundScreens = played.flatMap((round, index): Screen[] => {
    const leaderboard: Screen[] = index < played.length - 1 ? [{ kind: "leaderboard", roundId: round._id }] : [];
    return [{ kind: "roundIntro", roundId: round._id }, ...roundBody(round), ...leaderboard];
  });
  return [{ kind: "lobby" }, { kind: "rules" }, ...roundScreens, { kind: "finalLeaderboard" }];
}
