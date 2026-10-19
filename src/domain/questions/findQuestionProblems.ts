import type { QuestionContent } from "@convex/questions/questionContent";
import type { QuestionMedia } from "@convex/questions/table";
import { isBlank } from "@/domain/questionTypes/isBlank";
import { problemIf } from "@/domain/questionTypes/problemIf";
import { problemIfNotPositive } from "@/domain/questionTypes/problemIfNotPositive";
import type { Problem } from "@/domain/questionTypes/questionTypeRules";
import { rulesFor } from "@/domain/questionTypes/registry";

type QuestionDraft = {
  prompt: string;
  timeLimitSeconds: number | null;
  content: QuestionContent;
  media: QuestionMedia | null;
};

function findTimeLimitProblems(question: QuestionDraft): Problem[] {
  if (question.timeLimitSeconds === null) {
    return problemIf(rulesFor(question.content).requiresTimeLimit, "Den här frågetypen behöver en tidsgräns.");
  }
  return problemIfNotPositive(question.timeLimitSeconds, "Tidsgränsen måste vara större än 0.");
}

function findMediaProblems({ content, media }: QuestionDraft): Problem[] {
  if (!rulesFor(content).requiresVideo) return [];
  if (media?.kind !== "video") return [{ message: "Lägg till filmen." }];
  return problemIf(media.durationSeconds === null, "Filmens längd kunde inte läsas. Ladda upp den igen.");
}

// What still has to be filled in before the quiz can start. Empty means ready.
export function findQuestionProblems(question: QuestionDraft): Problem[] {
  return [
    ...problemIf(isBlank(question.prompt), "Skriv frågan som visas på TV:n."),
    ...findTimeLimitProblems(question),
    ...findMediaProblems(question),
    ...rulesFor(question.content).findProblems(question.content),
  ];
}
