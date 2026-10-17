import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ContentOf } from "@convex/questions/questionContent";
import { PaSparetEditor } from "./PaSparetEditor";

const content: ContentOf<"paSparet"> = {
  type: "paSparet",
  acceptedAnswers: ["Kiruna"],
  fuzzy: true,
  clues: [
    { text: "Gruva", points: 10 },
    { text: "Rymdbas", points: 8 },
  ],
};

describe("PaSparetEditor", () => {
  it("edits the destination and the clues' text and points", async () => {
    const onChange = vi.fn();
    render(<PaSparetEditor content={content} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Resmålet"), "{enter}Giron");
    expect(onChange.mock.lastCall?.[0].acceptedAnswers).toEqual(["Kiruna", "Giron"]);
    await userEvent.type(screen.getByLabelText("Ledtråd 2"), "!");
    expect(onChange.mock.lastCall?.[0].clues[1].text).toBe("Rymdbas!");
    await userEvent.type(screen.getByLabelText("Ledtråd 1: poäng"), "0");
    expect(onChange.mock.lastCall?.[0].clues[0].points).toBe(100);
  });

  it("adds and removes clues and toggles fuzzy matching", async () => {
    const onChange = vi.fn();
    render(<PaSparetEditor content={content} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Lägg till ledtråd" }));
    expect(onChange.mock.lastCall?.[0].clues).toHaveLength(3);
    await userEvent.click(screen.getByRole("button", { name: "Ta bort ledtråd 1" }));
    expect(onChange.mock.lastCall?.[0].clues).toEqual([{ text: "Rymdbas", points: 8 }]);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange.mock.lastCall?.[0].fuzzy).toBe(false);
  });
});
