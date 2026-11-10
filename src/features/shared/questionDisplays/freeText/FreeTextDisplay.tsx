import type { RevealedDisplayProps, ShownDisplayProps } from "@/features/shared/questionDisplays/QuestionDisplayProps";
import { fieldTitle } from "./fieldTitle";

// With sub-questions, their titles, so everyone sees what each field asks; a single field adds
// nothing beyond the prompt.
export function FreeTextQuestion({ shown }: ShownDisplayProps<"freeText">) {
  if (shown.labels.length < 2) return null;
  return (
    <ol className="flex flex-col gap-[0.8cqw]">
      {shown.labels.map((_, index) => (
        <li key={index} className="rounded-[1cqw] bg-card px-[1.6cqw] py-[0.8cqw] text-[2.4cqw] font-semibold">
          {fieldTitle(shown.labels, index)}
        </li>
      ))}
    </ol>
  );
}

// A single answer large; with sub-questions, each title with its answer.
export function FreeTextAnswer({ revealed }: RevealedDisplayProps<"freeText">) {
  const { fields } = revealed;
  if (fields.length < 2) {
    return (
      <p className="flex flex-1 items-center justify-center text-center text-[7cqw] leading-tight font-bold text-primary">
        {fields[0]?.answer}
      </p>
    );
  }
  const labels = fields.map((field) => field.label);
  return (
    <ol className="flex flex-col gap-[0.8cqw]">
      {fields.map((field, index) => (
        <li key={index} className="flex items-baseline gap-[1.4cqw] rounded-[1cqw] bg-card px-[1.6cqw] py-[0.8cqw] text-[2.4cqw]">
          <span className="text-muted-foreground">{fieldTitle(labels, index)}</span>
          <span className="font-semibold text-primary">{field.answer}</span>
        </li>
      ))}
    </ol>
  );
}
