import type { Doc } from "../_generated/dataModel";

type QuestionNumbers = Pick<Doc<"questions">, "timeLimitSeconds" | "content">;

// Questions saved before D28 hold NaN where a field was left empty; null means that now.
export function replaceNaNWithNull({ timeLimitSeconds, content }: QuestionNumbers): QuestionNumbers {
  // A half-typed map target was saved with a NaN coordinate; it isn't placed at all.
  const halfTyped = content.type === "mapPin" && content.target !== null && [content.target.lat, content.target.lng].some(Number.isNaN);
  const placedContent = halfTyped ? { ...content, target: null } : content;
  // Walks every field, so the result has the same shape with each NaN swapped for null.
  return withoutNaN({ timeLimitSeconds, content: placedContent }) as QuestionNumbers;
}

function withoutNaN(value: unknown): unknown {
  if (typeof value === "number") return Number.isNaN(value) ? null : value;
  if (Array.isArray(value)) return value.map(withoutNaN);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, field]) => [key, withoutNaN(field)]));
  }
  return value;
}
