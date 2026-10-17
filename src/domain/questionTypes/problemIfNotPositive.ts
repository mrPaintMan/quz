import { isPositive } from "@/domain/questionTypes/isPositive";
import { problemIf } from "@/domain/questionTypes/problemIf";
import type { Problem } from "@/domain/questionTypes/questionTypeRules";

export function problemIfNotPositive(value: number, message = "Poängen måste vara större än 0."): Problem[] {
  return problemIf(!isPositive(value), message);
}
