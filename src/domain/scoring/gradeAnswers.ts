import type { AnswerContent } from "@convex/answers/answerContent";
import type { QuestionContent } from "@convex/questions/questionContent";
import { isAnswerFor } from "@/domain/answers/isAnswerFor";
import { pointsOf, type Outcome } from "@/domain/answering/outcome";
import { answeringOf } from "@/domain/answering/registry";
import type { Verdict } from "@/domain/review/typedReview";

// What each answer counted as, part by part, and its points, in the order given (D58). The
// question's answers are graded together, as "närmast vinner" ranks the teams against each other.
// An answer that no longer fits its question (its type or fields were changed during the game),
// or one to a type whose grading isn't built yet, scores nothing and has no parts. Typed answers
// also count by the verdicts on their texts (D51).
export function outcomesOfAnswers(content: QuestionContent, answers: AnswerContent[], verdicts: Verdict[]): Outcome[] {
  const answering = answeringOf(content);
  const fits = answers.map((answer) => isAnswerFor(content, answer));
  const fitting = answers.filter((_answer, index) => fits[index]);
  const outcomes = answering === null ? [] : answering.outcomes(content, fitting, verdicts);
  let next = 0;
  return fits.map((fit) => (fit ? (outcomes[next++] ?? nothing) : nothing));
}

const nothing: Outcome = { points: 0, parts: [] };

// Each answer's points, as the scores count them: the points of its outcome.
export function gradeAnswers(content: QuestionContent, answers: AnswerContent[], verdicts: Verdict[]): number[] {
  return pointsOf(outcomesOfAnswers(content, answers, verdicts));
}
