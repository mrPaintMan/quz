import { describe, expect, it } from "vitest";
import { questionPlace, screenEyebrow } from "./questionPlace";

describe("questionPlace", () => {
  it("numbers a question answered in the app, and names an activity", () => {
    expect(questionPlace({ answeredInApp: true, questionNumber: 3 })).toBe("Fråga 3");
    expect(questionPlace({ answeredInApp: false, questionNumber: 3 })).toBe("Aktivitet");
  });
});

describe("screenEyebrow", () => {
  const place = { roundNumber: 2, filmNumber: null, questionNumber: 3, isTrip: false };

  it("gives the round and the question's place, or its answer's", () => {
    expect(screenEyebrow({ kind: "question", ...place, answeredInApp: true })).toBe("Omgång 2 · Fråga 3");
    expect(screenEyebrow({ kind: "question", ...place, answeredInApp: false })).toBe("Omgång 2 · Aktivitet");
    expect(screenEyebrow({ kind: "answer", ...place })).toBe("Omgång 2 · Svar på fråga 3");
  });

  it("names a question after a film by the film and its place under it", () => {
    expect(screenEyebrow({ kind: "question", ...place, filmNumber: 1, questionNumber: 2, answeredInApp: true })).toBe("Frågefilm 1 · Fråga 2");
    expect(screenEyebrow({ kind: "answer", ...place, filmNumber: 1, questionNumber: 2 })).toBe("Frågefilm 1 · Svar på fråga 2");
  });

  it("calls the trip På spåret, while asked and on its answer", () => {
    expect(screenEyebrow({ kind: "question", ...place, answeredInApp: true, isTrip: true })).toBe("På spåret");
    expect(screenEyebrow({ kind: "answer", ...place, isTrip: true })).toBe("På spåret");
  });
});

