import { describe, expect, it } from "vitest";
import type { QuestionContent } from "@convex/questions/questionContent";
import { judgeMessage, readJudgeReply, usesAiJudge } from "./aiJudge";

const slots = [
  { title: "a) Artist", options: [{ label: "ABBA", spellings: ["ABBA", " "] }] },
  { title: "", options: [{ label: "Vodka", spellings: ["Vodka"] }, { label: "Kahlúa", spellings: ["Kahlúa"] }] },
];
const items = [
  { slot: 0, text: "abbba", written: "Abbba", teamCount: 2 },
  { slot: 1, text: "kahlua", written: "Kahlua", teamCount: 1 },
  { slot: 1, text: "gin", written: "Gin", teamCount: 1 },
];

describe("usesAiJudge", () => {
  const freeText: QuestionContent = { type: "freeText", fields: [{ label: "", acceptedAnswers: ["ABBA"] }], pointsPerField: 1, fuzzy: true };

  it("is on for a type with typed answers whose switch is on", () => {
    expect(usesAiJudge(freeText)).toBe(true);
    expect(usesAiJudge({ ...freeText, fuzzy: false })).toBe(false);
  });

  it("is off for types without typed answers", () => {
    expect(usesAiJudge({ type: "multipleChoice", options: [], correctIndex: null, points: 1 })).toBe(false);
    expect(usesAiJudge({ type: "list", acceptedItems: [], pointsPerItem: 1, fuzzy: true, aiAssist: true })).toBe(false);
  });
});

describe("judgeMessage", () => {
  it("gives the question, each field's accepted answers by option number and the texts by id", () => {
    expect(JSON.parse(judgeMessage("Vem och vad?", slots, items))).toEqual({
      question: "Vem och vad?",
      fields: [
        { field: 0, title: "a) Artist", acceptedAnswers: [{ option: 0, spellings: ["ABBA"] }] },
        {
          field: 1,
          acceptedAnswers: [
            { option: 0, spellings: ["Vodka"] },
            { option: 1, spellings: ["Kahlúa"] },
          ],
        },
      ],
      answers: [
        { id: 0, field: 0, text: "Abbba" },
        { id: 1, field: 1, text: "Kahlua" },
        { id: 2, field: 1, text: "Gin" },
      ],
    });
  });
});

describe("readJudgeReply", () => {
  it("turns right into the option named and wrong into null, and leaves unsure out", () => {
    const reply = {
      verdicts: [
        { id: 0, verdict: "right", option: 0 },
        { id: 1, verdict: "unsure", option: 0 },
        { id: 2, verdict: "wrong", option: 0 },
      ],
    };
    expect(readJudgeReply(reply, slots, items)).toEqual([
      { slot: 0, text: "abbba", target: 0 },
      { slot: 1, text: "gin", target: null },
    ]);
  });

  it("leaves out ids that weren't asked, options that don't exist and repeated ids", () => {
    const reply = {
      verdicts: [
        { id: 7, verdict: "right", option: 0 },
        { id: 1, verdict: "right", option: 2 },
        { id: 0, verdict: "right", option: 0.5 },
        { id: 2, verdict: "wrong", option: 0 },
        { id: 2, verdict: "right", option: 0 },
        "fel",
      ],
    };
    expect(readJudgeReply(reply, slots, items)).toEqual([{ slot: 1, text: "gin", target: null }]);
  });

  it("counts only an id's first entry, even when that one is unsure", () => {
    const reply = {
      verdicts: [
        { id: 0, verdict: "unsure", option: 0 },
        { id: 0, verdict: "right", option: 0 },
      ],
    };
    expect(readJudgeReply(reply, slots, items)).toEqual([]);
  });

  it("gives nothing for a reply of the wrong shape", () => {
    expect(readJudgeReply(null, slots, items)).toEqual([]);
    expect(readJudgeReply({ verdicts: "alla rätt" }, slots, items)).toEqual([]);
  });
});
