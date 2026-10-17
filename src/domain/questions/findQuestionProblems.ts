import type { QuestionContent } from "@convex/questions/questionContent";
import { isBlank } from "../questionTypes/isBlank";
import { problemIf } from "../questionTypes/problemIf";
import type { Problem } from "../questionTypes/questionTypeRules";
import { rulesFor } from "../questionTypes/registry";

type QuestionDraft = {
  prompt: string;
  timeLimitSeconds: number | null;
  content: QuestionContent;
};

function findTimeLimitProblems(question: QuestionDraft): Problem[] {
  if (question.timeLimitSeconds === null) {
    return problemIf(rulesFor(question.content).requiresTimeLimit, "Den här frågetypen behöver en tidsgräns.");
  }
  return problemIf(question.timeLimitSeconds <= 0, "Tidsgränsen måste vara större än 0.");
}

// What still has to be filled in before the quiz can start. Empty means ready.
export function findQuestionProblems(question: QuestionDraft): Problem[] {
  return [
    ...problemIf(isBlank(question.prompt), "Skriv frågan som visas på TV:n."),
    ...findTimeLimitProblems(question),
    ...rulesFor(question.content).findProblems(question.content),
  ];
}
