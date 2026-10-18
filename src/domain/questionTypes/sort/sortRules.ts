import type { ContentOf } from "@convex/questions/questionContent";
import { hasDuplicates } from "@/domain/questionTypes/hasDuplicates";
import { isBlank } from "@/domain/questionTypes/isBlank";
import { problemIf } from "@/domain/questionTypes/problemIf";
import { problemIfNotPositive } from "@/domain/questionTypes/problemIfNotPositive";
import type { QuestionTypeRules } from "@/domain/questionTypes/questionTypeRules";
import { multiplyPoints } from "@/domain/questionTypes/multiplyPoints";

type SortContent = ContentOf<"sort">;

const MIN_ITEMS = 2;

export const sortRules: QuestionTypeRules<SortContent> = {
  requiresTimeLimit: false,
  createEmptyContent: () => ({
    type: "sort",
    items: ["", ""],
    firstLabel: "",
    lastLabel: "",
    pointsPerItem: 1,
  }),
  maxPoints: (content) => multiplyPoints(content.items.length, content.pointsPerItem),
  findProblems: (content) => [
    ...problemIf(content.items.length < MIN_ITEMS, `Lägg till minst ${MIN_ITEMS} alternativ att sortera.`),
    ...content.items.flatMap((item, index) => problemIf(isBlank(item), `Alternativ ${index + 1} saknar text.`)),
    ...problemIf(hasDuplicates(content.items), "Två alternativ har samma text, så ordningen blir tvetydig."),
    ...problemIf(isBlank(content.firstLabel) || isBlank(content.lastLabel), "Ange vad högst upp och längst ner betyder, till exempel Störst och Minst."),
    ...problemIfNotPositive(content.pointsPerItem),
  ],
};
