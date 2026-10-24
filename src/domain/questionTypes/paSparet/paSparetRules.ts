import type { ContentOf } from "@convex/questions/questionContent";
import { hasSpelling } from "@/domain/questionTypes/hasSpelling";
import { isBlank } from "@/domain/questionTypes/isBlank";
import { problemIf } from "@/domain/questionTypes/problemIf";
import type { QuestionTypeRules } from "@/domain/questionTypes/questionTypeRules";

type PaSparetContent = ContentOf<"paSparet">;

// What each clue is worth, hardest first; a trip always has exactly these five (D30).
export const PA_SPARET_CLUE_POINTS = [10, 8, 6, 4, 2] as const;

export const paSparetRules: QuestionTypeRules<PaSparetContent> = {
  requiresTimeLimit: false,
  requiresVideo: true,
  hasAnswerScreen: true,
  createEmptyContent: () => ({
    type: "paSparet",
    acceptedAnswers: [],
    fuzzy: true,
    clues: PA_SPARET_CLUE_POINTS.map(() => ""),
  }),
  maxPoints: () => PA_SPARET_CLUE_POINTS[0],
  findProblems: (content) => [
    ...problemIf(!hasSpelling(content.acceptedAnswers), "Ange resmålet."),
    ...problemIf(content.clues.length !== PA_SPARET_CLUE_POINTS.length, "En resa har fem ledtrådar."),
    ...content.clues.flatMap((clue, index) => problemIf(isBlank(clue), `Ledtråd ${index + 1} saknar text.`)),
  ],
};
