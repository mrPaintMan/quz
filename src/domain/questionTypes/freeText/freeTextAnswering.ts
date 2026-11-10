import type { AnswerOf } from "@convex/answers/answerContent";
import type { ContentOf } from "@convex/questions/questionContent";
import type { AnsweringRules } from "@/domain/answering/answeringRules";
import { firstFilledIn } from "@/domain/questionTypes/firstFilledIn";
import { isBlank } from "@/domain/questionTypes/isBlank";
import { gradeTyped, type TypedReview } from "@/domain/review/typedReview";
import { fieldTitle } from "./fieldTitle";

// While asked, each field's label (blank with a single field, whose editor hides the label); on
// the answer screen, each field's label with its first filled-in accepted answer.
export type FreeTextShown = { type: "freeText"; labels: string[] };
export type FreeTextRevealed = { type: "freeText"; fields: { label: string; answer: string }[] };

const labelsOf = (fields: { label: string }[]) => fields.map((field) => (fields.length > 1 ? field.label : ""));

// Each field is a slot of its own, with its accepted answers as its one option.
const freeTextReview: TypedReview<ContentOf<"freeText">, AnswerOf<"freeText">> = {
  slots: ({ fields }) => {
    const labels = labelsOf(fields);
    return fields.map((field, index) => ({
      title: labels.length > 1 ? fieldTitle(labels, index) : "",
      options: [{ label: firstFilledIn(field.acceptedAnswers), spellings: field.acceptedAnswers }],
    }));
  },
  texts: ({ fields }) => fields.map((text, slot) => ({ slot, text })),
  pointsPerMatch: ({ pointsPerField }) => pointsPerField ?? 0,
};

export const freeTextAnswering: AnsweringRules<"freeText", FreeTextShown, FreeTextRevealed> = {
  show: ({ fields }) => ({ type: "freeText", labels: labelsOf(fields) }),
  reveal: ({ fields }) => {
    const labels = labelsOf(fields);
    return { type: "freeText", fields: fields.map((field, index) => ({ label: labels[index], answer: firstFilledIn(field.acceptedAnswers) })) };
  },
  imageIds: () => [],
  startingAnswer: () => null,
  // One text per field; with sub-questions, a team may leave some blank as long as one is filled in.
  isComplete: (shown, { fields }) => fields.length === shown.labels.length && fields.some((field) => !isBlank(field)),
  // The points per field for each field whose text matches one of that field's own accepted
  // answers, compared as everywhere else (normalizeForComparison), or by the hosts' verdict (D51).
  grade: (content, answers, verdicts = []) => gradeTyped(freeTextReview, content, answers, verdicts),
  review: freeTextReview,
};
