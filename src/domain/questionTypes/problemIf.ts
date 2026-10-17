import type { Problem } from "./questionTypeRules";

export function problemIf(condition: boolean, message: string): Problem[] {
  return condition ? [{ message }] : [];
}
