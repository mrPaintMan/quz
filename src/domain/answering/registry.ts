import type { Id } from "@convex/_generated/dataModel";
import type { AnswerContent, AnsweredType } from "@convex/answers/answerContent";
import type { QuestionContent } from "@convex/questions/questionContent";
import { rulesFor } from "@/domain/questionTypes/registry";
import {
  multipleChoiceAnswering,
  type MultipleChoiceRevealed,
  type MultipleChoiceShown,
} from "@/domain/questionTypes/multipleChoice/multipleChoiceAnswering";
import { numberAnswering, type NumberRevealed, type NumberShown } from "@/domain/questionTypes/number/numberAnswering";
import { sortAnswering, type SortRevealed, type SortShown } from "@/domain/questionTypes/sort/sortAnswering";
import type { AnsweringRules } from "./answeringRules";

// What any question shows while asked, and reveals on its answer screen; one per type built.
export type ShownQuestion = MultipleChoiceShown | NumberShown | SortShown;
export type RevealedAnswer = MultipleChoiceRevealed | NumberRevealed | SortRevealed;

type Registry = {
  [T in AnsweredType]: AnsweringRules<T, Extract<ShownQuestion, { type: T }>, Extract<RevealedAnswer, { type: T }>> | null;
};

// Every type answered in the app has an entry; null until its answering is built in M3, so the
// phones keep pointing at the TV for it. Activities are scored by the hosts and have none.
export const answeringRegistry: Registry = {
  multipleChoice: multipleChoiceAnswering,
  freeText: null,
  number: numberAnswering,
  sort: sortAnswering,
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
  startingAnswer: (shown: ShownQuestion) => AnswerContent | null;
  isComplete: (shown: ShownQuestion, answer: AnswerContent) => boolean;
  grade: (content: QuestionContent, answers: AnswerContent[]) => number[];
};

// TypeScript can't link a type to its entry on its own; Registry guarantees they match.
const answeringOfType = (type: AnsweredType) => answeringRegistry[type] as unknown as AnyAnsweringRules | null;

// The answering of a question's type, or null for an activity or a type not built yet.
export function answeringOf(content: QuestionContent): AnyAnsweringRules | null {
  return rulesFor(content).answeredInApp ? answeringOfType(content.type as AnsweredType) : null;
}

// The team's answer before it changes anything, such as a sort question's shuffled order.
export function startingAnswerOf(shown: ShownQuestion): AnswerContent | null {
  return answeringOfType(shown.type)?.startingAnswer(shown) ?? null;
}

// Whether an answer is filled in enough to send, judged by its own type against what the question
// shows; a type whose answering isn't built yet has no rule and counts as complete.
export function isAnswerComplete(shown: ShownQuestion | null, answer: AnswerContent): boolean {
  const answering = answeringOfType(answer.type);
  return answering === null || (shown !== null && answering.isComplete(shown, answer));
}
