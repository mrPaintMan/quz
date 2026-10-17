import type { ContentOf } from "@convex/questions/questionContent";
import { isBlank } from "../isBlank";
import { problemIf } from "../problemIf";
import type { QuestionTypeRules } from "../questionTypeRules";

type SortContent = ContentOf<"sort">;

const MIN_ITEMS = 2;

export const sortRules: QuestionTypeRules<SortContent> = {
  requiresTimeLimit: false,
  maxPoints: (content) => content.items.length * content.pointsPerItem,
  findProblems: (content) => [
    ...problemIf(content.items.length < MIN_ITEMS, `Lägg till minst ${MIN_ITEMS} saker att sortera.`),
    ...content.items.flatMap((item, index) => problemIf(isBlank(item), `Sak ${index + 1} saknar text.`)),
    ...problemIf(isBlank(content.firstLabel) || isBlank(content.lastLabel), "Ange vad början och slutet betyder, till exempel Äldst och Nyast."),
    ...problemIf(content.pointsPerItem <= 0, "Poängen måste vara större än 0."),
  ],
};
