// Shared by the result view tests; *.setup.ts files are left out of coverage (docs/engineering.md).
import type { Outcome, OutcomePart } from "@/domain/answering/outcome";

export const part = (result: OutcomePart["result"], points = result === "right" ? 1 : 0, given = ""): OutcomePart => ({ label: "", given, result, correct: "", points });
export const outcomeOf = (...parts: OutcomePart[]): Outcome => ({ points: parts.reduce((sum, each) => sum + each.points, 0), parts });
