import { describe, expect, it } from "vitest";
import { questionTypeRules } from "@/domain/questionTypes/registry";
import { questionEditors } from "./registry";

describe("questionEditors", () => {
  it("has a Swedish label and an editor for every question type", () => {
    expect(Object.keys(questionEditors).sort()).toEqual(Object.keys(questionTypeRules).sort());
    for (const { label, Editor } of Object.values(questionEditors)) {
      expect(label).not.toBe("");
      expect(Editor).toBeTypeOf("function");
    }
  });
});
