import type { ContentOf } from "@convex/questions/questionContent";
import { hasDuplicates } from "@/domain/questionTypes/hasDuplicates";
import { hasSpelling } from "@/domain/questionTypes/hasSpelling";
import { normalizeForComparison } from "@/domain/questionTypes/normalizeForComparison";
import { problemIf } from "@/domain/questionTypes/problemIf";
import { problemIfNotPositive } from "@/domain/questionTypes/problemIfNotPositive";
import type { QuestionTypeRules } from "@/domain/questionTypes/questionTypeRules";

type IngredientsContent = ContentOf<"ingredients">;

// Repeats within one ingredient are harmless; only a spelling shared by two ingredients is ambiguous.
function spellingsShareAnItem(content: IngredientsContent): boolean {
  const uniqueSpellingsPerItem = content.items.map((item) => [...new Set(item.spellings.map(normalizeForComparison))]);
  return hasDuplicates(uniqueSpellingsPerItem.flat());
}

export const ingredientsRules: QuestionTypeRules<IngredientsContent> = {
  requiresTimeLimit: false,
  createEmptyContent: () => ({
    type: "ingredients",
    items: Array.from({ length: 3 }, () => ({ spellings: [] })),
    pointsPerItem: 1,
    fuzzy: true,
  }),
  maxPoints: (content) => content.items.length * content.pointsPerItem,
  findProblems: (content) => [
    ...problemIf(content.items.length === 0, "Lägg till minst en ingrediens."),
    ...content.items.flatMap((item, index) =>
      problemIf(!hasSpelling(item.spellings), `Ingrediens ${index + 1} saknar text.`),
    ),
    ...problemIf(spellingsShareAnItem(content), "Samma stavning finns i flera ingredienser."),
    ...problemIfNotPositive(content.pointsPerItem),
  ],
};
