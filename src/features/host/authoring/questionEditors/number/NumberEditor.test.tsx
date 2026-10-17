import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ContentOf } from "@convex/questions/questionContent";
import { NumberEditor } from "./NumberEditor";

const tiers: ContentOf<"number"> = {
  type: "number",
  answer: 66,
  scoring: { mode: "tiers", tiers: [{ within: 1, points: 3 }] },
};
const closest: ContentOf<"number"> = { type: "number", answer: null, scoring: { mode: "closest", pointsByRank: [3, 2] } };

describe("NumberEditor", () => {
  it("edits the answer and clears it to null", async () => {
    const onChange = vi.fn();
    render(<NumberEditor content={tiers} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Rätt svar"), "0");
    expect(onChange.mock.lastCall?.[0].answer).toBe(660);
    await userEvent.clear(screen.getByLabelText("Rätt svar"));
    expect(onChange.mock.lastCall?.[0].answer).toBeNull();
  });

  it("switches between tiers and closest wins", async () => {
    const onChange = vi.fn();
    render(<NumberEditor content={tiers} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Närmast vinner" }));
    expect(onChange.mock.lastCall?.[0].scoring).toEqual({ mode: "closest", pointsByRank: [3, 2, 1] });
    await userEvent.click(screen.getByRole("button", { name: "Poängnivåer (±)" }));
    expect(onChange.mock.lastCall?.[0].scoring).toEqual({ mode: "tiers", tiers: [{ within: 0, points: 1 }] });
  });

  it("edits, adds and removes tiers", async () => {
    const onChange = vi.fn();
    render(<NumberEditor content={tiers} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Nivå 1: inom ±"), "0");
    expect(onChange.mock.lastCall?.[0].scoring.tiers[0].within).toBe(10);
    await userEvent.type(screen.getByLabelText("Nivå 1: poäng"), "0");
    expect(onChange.mock.lastCall?.[0].scoring.tiers[0].points).toBe(30);
    await userEvent.click(screen.getByRole("button", { name: "Lägg till nivå" }));
    expect(onChange.mock.lastCall?.[0].scoring.tiers).toHaveLength(2);
    await userEvent.click(screen.getByRole("button", { name: "Ta bort nivå 1" }));
    expect(onChange.mock.lastCall?.[0].scoring.tiers).toEqual([]);
  });

  it("edits, adds and removes placings", async () => {
    const onChange = vi.fn();
    render(<NumberEditor content={closest} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Plats 2: poäng"), "0");
    expect(onChange.mock.lastCall?.[0].scoring.pointsByRank).toEqual([3, 20]);
    await userEvent.click(screen.getByRole("button", { name: "Lägg till placering" }));
    expect(onChange.mock.lastCall?.[0].scoring.pointsByRank).toHaveLength(3);
    await userEvent.click(screen.getByRole("button", { name: "Ta bort plats 1" }));
    expect(onChange.mock.lastCall?.[0].scoring.pointsByRank).toEqual([2]);
  });
});
