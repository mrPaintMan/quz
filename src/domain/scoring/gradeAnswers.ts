import type { AnswerContent } from "@convex/answers/answerContent";
import type { QuestionContent } from "@convex/questions/questionContent";
import { isAnswerFor } from "@/domain/answers/isAnswerFor";
import { pointsOf } from "@/domain/answering/outcome";
import { answeringOf } from "@/domain/answering/registry";
import type { Verdict } from "@/domain/review/typedReview";

// Each answer's points as graded automatically, in the order given. The question's answers are
// graded together, as "närmast vinner" ranks the teams against each other. An answer that no
// longer fits its question (its type was changed during the game), or a type whose grading isn't
// built yet, scores nothing. Typed answers also count by the hosts' verdicts (D51).
export function gradeAnswers(content: QuestionContent, answers: AnswerContent[], verdicts: Verdict[]): number[] {
  const answering = answeringOf(content);
  const fits = answers.map((answer) => isAnswerFor(content, answer));
  const fitting = answers.filter((_answer, index) => fits[index]);
  const points = answering === null ? [] : pointsOf(answering.outcomes(content, fitting, verdicts));
  let next = 0;
  return fits.map((fit) => (fit ? (points[next++] ?? 0) : 0));
}
