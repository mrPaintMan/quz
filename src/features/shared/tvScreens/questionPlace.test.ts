import { describe, expect, it } from "vitest";
import { questionPlace } from "./questionPlace";

describe("questionPlace", () => {
  it("numbers a question answered in the app, and names an activity", () => {
    expect(questionPlace({ answeredInApp: true, questionNumber: 3 })).toBe("Fråga 3");
    expect(questionPlace({ answeredInApp: false, questionNumber: 3 })).toBe("Aktivitet");
  });
});
