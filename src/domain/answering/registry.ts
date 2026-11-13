import type { Id } from "@convex/_generated/dataModel";
import type { AnswerContent, AnsweredType } from "@convex/answers/answerContent";
import type { QuestionContent } from "@convex/questions/questionContent";
import { rulesFor } from "@/domain/questionTypes/registry";
import { drawingAnswering, type DrawingRevealed, type DrawingShown } from "@/domain/questionTypes/drawing/drawingAnswering";
import { freeTextAnswering, type FreeTextRevealed, type FreeTextShown } from "@/domain/questionTypes/freeText/freeTextAnswering";
import {
  ingredientsAnswering,
  type IngredientsRevealed,
  type IngredientsShown,
} from "@/domain/questionTypes/ingredients/ingredientsAnswering";
import { listAnswering, MAX_LIST_ITEMS, type ListRevealed, type ListShown } from "@/domain/questionTypes/list/listAnswering";
import { mapPinAnswering, type MapPinRevealed, type MapPinShown } from "@/domain/questionTypes/mapPin/mapPinAnswering";
import { matchAnswering, type MatchRevealed, type MatchShown } from "@/domain/questionTypes/match/matchAnswering";
import {
  multipleChoiceAnswering,
  type MultipleChoiceRevealed,
  type MultipleChoiceShown,
} from "@/domain/questionTypes/multipleChoice/multipleChoiceAnswering";
import { numberAnswering, type NumberRevealed, type NumberShown } from "@/domain/questionTypes/number/numberAnswering";
import { paSparetAnswering, type PaSparetRevealed, type PaSparetShown } from "@/domain/questionTypes/paSparet/paSparetAnswering";
import { sortAnswering, type SortRevealed, type SortShown } from "@/domain/questionTypes/sort/sortAnswering";
import type { TypedReview, Verdict } from "@/domain/review/typedReview";
import type { AnsweringRules, FilmPosition, Graded } from "./answeringRules";
import type { Outcome } from "./outcome";

// What any question shows while asked, and reveals on its answer screen; one per type built.
export type ShownQuestion =
  | MultipleChoiceShown
  | FreeTextShown
  | NumberShown
  | SortShown
  | MatchShown
  | ListShown
  | IngredientsShown
  | MapPinShown
  | DrawingShown
  | PaSparetShown;
export type RevealedAnswer =
  | MultipleChoiceRevealed
  | FreeTextRevealed
  | NumberRevealed
  | SortRevealed
  | MatchRevealed
  | ListRevealed
  | IngredientsRevealed
  | MapPinRevealed
  | DrawingRevealed
  | PaSparetRevealed;

type Registry = {
  [T in AnsweredType]: AnsweringRules<T, Extract<ShownQuestion, { type: T }>, Extract<RevealedAnswer, { type: T }>> | null;
};

// Every type answered in the app has an entry; null until its answering is built in M3, so the
// phones keep pointing at the TV for it. Activities are scored by the hosts and have none.
export const answeringRegistry: Registry = {
  multipleChoice: multipleChoiceAnswering,
  freeText: freeTextAnswering,
  number: numberAnswering,
  sort: sortAnswering,
  match: matchAnswering,
  list: listAnswering,
  ingredients: ingredientsAnswering,
  drawing: drawingAnswering,
  mapPin: mapPinAnswering,
  paSparet: paSparetAnswering,
};

// The registry's entries seen from shared code, which passes each one its own type's content and
// answers; the server checks an answer's type against its question first (isAnswerFor).
type AnyAnsweringRules = {
  show: (content: QuestionContent) => ShownQuestion;
  reveal: (content: QuestionContent, graded?: Graded<AnswerContent>) => RevealedAnswer;
  revealsAnswers?: boolean;
  revealsTeams?: boolean;
  revealToTeams?: (content: QuestionContent, graded: Graded<AnswerContent>) => RevealedAnswer;
  imageIds: (content: QuestionContent) => Id<"_storage">[];
  startingAnswer: (shown: ShownQuestion) => AnswerContent | null;
  isComplete: (shown: ShownQuestion, answer: AnswerContent) => boolean;
  outcomes: (content: QuestionContent, answers: AnswerContent[], verdicts?: Verdict[]) => Outcome[];
  review?: TypedReview<QuestionContent, AnswerContent>;
  scoredByHand?: boolean;
  sendsWithBrake?: boolean;
  stamp?: (answer: AnswerContent, film: FilmPosition, isSending: boolean) => AnswerContent;
  fitsLimits?: (answer: AnswerContent) => boolean;
};

// TypeScript can't link a type to its entry on its own; Registry guarantees they match.
const answeringOfType = (type: AnsweredType) => answeringRegistry[type] as unknown as AnyAnsweringRules | null;

// The answering of a question's type, or null for an activity or a type not built yet.
export function answeringOf(content: QuestionContent): AnyAnsweringRules | null {
  return rulesFor(content).answeredInApp ? answeringOfType(content.type as AnsweredType) : null;
}

// How a question's typed answers are judged by the hosts, or null for a type without typed answers.
export function reviewOf(content: QuestionContent): TypedReview<QuestionContent, AnswerContent> | null {
  return answeringOf(content)?.review ?? null;
}

// Whether a type's answer is sent by pulling the emergency brake, for the phone's button and the
// TV's count (D63).
export function sendsWithBrake(type: AnsweredType): boolean {
  return answeringOfType(type)?.sendsWithBrake === true;
}

// What the server sets on an answer from where its question's film is, such as a trip's brake
// (D63); other answers are left as sent.
export function stampAnswer(answer: AnswerContent, film: FilmPosition, isSending: boolean): AnswerContent {
  return answeringOfType(answer.type)?.stamp?.(answer, film, isSending) ?? answer;
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

// The longest typed text, and the most texts, one answer may hold: far more than a team writes, and
// it bounds what the server and the AI judge read (D53). A list's own cap is the same count.
export const MAX_TYPED_TEXT_LENGTH = 200;
export const MAX_TYPED_TEXTS = MAX_LIST_ITEMS;

// Whether an answer's typed texts stay within those bounds, and the answer within its type's own,
// such as a drawing's points (D62); other answers always do.
export function fitsAnswerLimits(answer: AnswerContent): boolean {
  const answering = answeringOfType(answer.type);
  const texts = answering?.review?.texts(answer) ?? [];
  const fitsTexts = texts.length <= MAX_TYPED_TEXTS && texts.every(({ text }) => text.length <= MAX_TYPED_TEXT_LENGTH);
  return fitsTexts && (answering?.fitsLimits?.(answer) ?? true);
}
