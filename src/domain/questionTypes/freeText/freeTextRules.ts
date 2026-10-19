import type { ContentOf } from "@convex/questions/questionContent";
import { hasSpelling } from "@/domain/questionTypes/hasSpelling";
import { problemIf } from "@/domain/questionTypes/problemIf";
import { problemIfNotPositive } from "@/domain/questionTypes/problemIfNotPositive";
import type { QuestionTypeRules } from "@/domain/questionTypes/questionTypeRules";
import { multiplyPoints } from "@/domain/questionTypes/multiplyPoints";

type FreeTextContent = ContentOf<"freeText">;

const MIN_FIELDS = 1;
const MAX_FIELDS = 3;

function findFieldProblems(content: FreeTextContent) {
  const single = content.fields.length === 1;
  return content.fields.flatMap((field, index) =>
    problemIf(
      !hasSpelling(field.acceptedAnswers),
      single ? "Lägg till minst ett godkänt svar." : `Delfråga ${index + 1} saknar godkänt svar.`,
    ),
  );
}

export const freeTextRules: QuestionTypeRules<FreeTextContent> = {
  requiresTimeLimit: false,
  requiresVideo: false,
  createEmptyContent: () => ({
    type: "freeText",
    fields: [{ label: "", acceptedAnswers: [] }],
    pointsPerField: 1,
    fuzzy: true,
  }),
  maxPoints: (content) => multiplyPoints(content.fields.length, content.pointsPerField),
  findProblems: (content) => [
    ...problemIf(
      content.fields.length < MIN_FIELDS || content.fields.length > MAX_FIELDS,
      `Frågan ska ha ${MIN_FIELDS}–${MAX_FIELDS} svarsfält.`,
    ),
    ...findFieldProblems(content),
    ...problemIfNotPositive(content.pointsPerField),
  ],
};
