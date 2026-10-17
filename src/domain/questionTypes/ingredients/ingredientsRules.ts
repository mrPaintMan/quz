import type { ContentOf } from "@convex/questions/questionContent";
import { hasSpelling } from "../hasSpelling";
import { problemIf } from "../problemIf";
import type { QuestionTypeRules } from "../questionTypeRules";

type IngredientsContent = ContentOf<"ingredients">;

export const ingredientsRules: QuestionTypeRules<IngredientsContent> = {
  requiresTimeLimit: false,
  maxPoints: (content) => content.items.length * content.pointsPerItem,
  findProblems: (content) => [
    ...problemIf(content.items.length === 0, "Lägg till minst en ingrediens."),
    ...content.items.flatMap((item, index) =>
      problemIf(!hasSpelling(item.spellings), `Ingrediens ${index + 1} saknar text.`),
    ),
    ...problemIf(content.pointsPerItem <= 0, "Poängen måste vara större än 0."),
  ],
};
