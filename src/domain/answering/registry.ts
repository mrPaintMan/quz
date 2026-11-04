import type { Id } from "@convex/_generated/dataModel";
import type { AnswerContent, AnsweredType } from "@convex/answers/answerContent";
import type { QuestionContent } from "@convex/questions/questionContent";
import { rulesFor } from "@/domain/questionTypes/registry";
import {
  multipleChoiceAnswering,
  type MultipleChoiceRevealed,
  type MultipleChoiceShown,
} from "@/domain/questionTypes/multipleChoice/multipleChoiceAnswering";
import type { AnsweringRules } from "./answeringRules";

// What any question shows while asked, and reveals on its answer screen; one per type built.
export type ShownQuestion = MultipleChoiceShown;
export type RevealedAnswer = MultipleChoiceRevealed;

type Registry = {
  [T in AnsweredType]: AnsweringRules<T, Extract<ShownQuestion, { type: T }>, Extract<RevealedAnswer, { type: T }>> | null;
};

// Every type answered in the app has an entry; null until its answering is built in M3, so the
// phones keep pointing at the TV for it. Activities are scored by the hosts and have none.
export const answeringRegistry: Registry = {
  multipleChoice: multipleChoiceAnswering,
  freeText: null,
  number: null,
  sort: null,
  match: null,
  list: null,
  ingredients: null,
  drawing: null,
  mapPin: null,
  paSparet: null,
};

// The registry's entries seen from shared code, which passes each one its own type's content and
// answers; the server checks an answer's type against its question first (isAnswerFor).
type AnyAnsweringRules = {
  show: (content: QuestionContent) => ShownQuestion;
  reveal: (content: QuestionContent) => RevealedAnswer;
  imageIds: (content: QuestionContent) => Id<"_storage">[];
  isComplete: (answer: AnswerContent) => boolean;
  grade: (content: QuestionContent, answer: AnswerContent) => number;
};

// The answering of a question's type, or null for an activity or a type not built yet.
export function answeringOf(content: QuestionContent): AnyAnsweringRules | null {
  if (!rulesFor(content).answeredInApp) return null;
  // TypeScript can't link content.type to its entry on its own; Registry guarantees they match.
  return answeringRegistry[content.type as AnsweredType] as unknown as AnyAnsweringRules | null;
}

// Whether an answer is filled in enough to send, by its own type's rule; a type whose answering
// isn't built yet has no rule and counts as complete.
export function isAnswerComplete(answer: AnswerContent): boolean {
  const answering = answeringRegistry[answer.type] as unknown as AnyAnsweringRules | null;
  return answering?.isComplete(answer) ?? true;
}
