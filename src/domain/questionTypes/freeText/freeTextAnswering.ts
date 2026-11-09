import type { AnsweringRules } from "@/domain/answering/answeringRules";
import { isBlank } from "@/domain/questionTypes/isBlank";
import { normalizeForComparison } from "@/domain/questionTypes/normalizeForComparison";

// While asked, each field's label (blank with a single field, whose editor hides the label); on
// the answer screen, each field's label with its first accepted answer.
export type FreeTextShown = { type: "freeText"; labels: string[] };
export type FreeTextRevealed = { type: "freeText"; fields: { label: string; answer: string }[] };

const labelsOf = (fields: { label: string }[]) => fields.map((field) => (fields.length > 1 ? field.label : ""));

export const freeTextAnswering: AnsweringRules<"freeText", FreeTextShown, FreeTextRevealed> = {
  show: ({ fields }) => ({ type: "freeText", labels: labelsOf(fields) }),
  reveal: ({ fields }) => {
    const labels = labelsOf(fields);
    return { type: "freeText", fields: fields.map((field, index) => ({ label: labels[index], answer: field.acceptedAnswers[0] ?? "" })) };
  },
  imageIds: () => [],
  startingAnswer: () => null,
  // One text per field; with sub-questions, a team may leave some blank as long as one is filled in.
  isComplete: (shown, { fields }) => fields.length === shown.labels.length && fields.some((field) => !isBlank(field)),
  // The points per field for each field whose text matches one of that field's accepted answers,
  // compared as everywhere else (normalizeForComparison); near misses are left to the AI judge (D50).
  // Empty texts never match anything.
  grade: ({ fields, pointsPerField }, answers) => {
    const acceptedOf = fields.map((field) => new Set(field.acceptedAnswers.map(normalizeForComparison).filter((text) => text !== "")));
    return answers.map((answer) => {
      const right = acceptedOf.filter((accepted, index) => accepted.has(normalizeForComparison(answer.fields[index] ?? "")));
      return right.length * (pointsPerField ?? 0);
    });
  },
};
