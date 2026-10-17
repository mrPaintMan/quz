import { describe, expect, it } from "vitest";
import { questionType } from "./questionType";

describe("questionType", () => {
  it("accepts exactly the types in the content union", () => {
    const types = questionType.members.map((member) => member.value);
    expect(types).toEqual([
      "multipleChoice",
      "freeText",
      "number",
      "sort",
      "match",
      "list",
      "ingredients",
      "drawing",
      "mapPin",
      "paSparet",
      "activity",
    ]);
  });
});
