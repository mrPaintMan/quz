import type { ContentOf } from "@convex/questions/questionContent";
import { hasDuplicates } from "@/domain/questionTypes/hasDuplicates";
import { isBlank } from "@/domain/questionTypes/isBlank";
import { problemIf } from "@/domain/questionTypes/problemIf";
import { problemIfNotPositive } from "@/domain/questionTypes/problemIfNotPositive";
import type { QuestionTypeRules } from "@/domain/questionTypes/questionTypeRules";

type SortContent = ContentOf<"sort">;

const MIN_ITEMS = 2;

export const sortRules: QuestionTypeRules<SortContent> = {
  requiresTimeLimit: false,
  maxPoints: (content) => content.items.length * content.pointsPerItem,
  findProblems: (content) => [
    ...problemIf(content.items.length < MIN_ITEMS, `Lägg till minst ${MIN_ITEMS} saker att sortera.`),
    ...content.items.flatMap((item, index) => problemIf(isBlank(item), `Sak ${index + 1} saknar text.`)),
    ...problemIf(hasDuplicates(content.items), "Två saker har samma text, så ordningen blir tvetydig."),
    ...problemIf(isBlank(content.firstLabel) || isBlank(content.lastLabel), "Ange vad början och slutet betyder, till exempel Äldst och Nyast."),
    ...problemIfNotPositive(content.pointsPerItem),
  ],
};
