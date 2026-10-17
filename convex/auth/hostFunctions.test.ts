import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { host, setupConvexTest } from "../test.setup";

describe("host functions", () => {
  it("run when given the host passphrase", async () => {
    const t = setupConvexTest();
    await expect(t.query(api.quizzes.queries.listQuizzes, host)).resolves.toEqual([]);
  });

  it("refuse a wrong passphrase before running", async () => {
    const t = setupConvexTest();
    await expect(t.mutation(api.quizzes.mutations.createQuiz, { hostPassphrase: "fel", title: "Julquiz", year: 2026 })).rejects.toThrow(
      "Fel lösenord.",
    );
  });
});
