import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ContentOf } from "@convex/questions/questionContent";
import { MatchEditor } from "./MatchEditor";

const content: ContentOf<"match"> = { type: "match", pairs: [{ left: "Oslo", right: "Norge" }], pointsPerPair: 1 };

describe("MatchEditor", () => {
  it("edits both sides, adds and removes pairs, and edits the points", async () => {
    const onChange = vi.fn();
    render(<MatchEditor content={content} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Par 1, vänster"), "!");
    expect(onChange.mock.lastCall?.[0].pairs[0]).toEqual({ left: "Oslo!", right: "Norge" });
    await userEvent.type(screen.getByLabelText("Par 1, höger"), "!");
    expect(onChange.mock.lastCall?.[0].pairs[0]).toEqual({ left: "Oslo", right: "Norge!" });
    await userEvent.click(screen.getByRole("button", { name: "Lägg till par" }));
    expect(onChange.mock.lastCall?.[0].pairs).toHaveLength(2);
    await userEvent.click(screen.getByRole("button", { name: "Ta bort par 1" }));
    expect(onChange.mock.lastCall?.[0].pairs).toEqual([]);
    await userEvent.type(screen.getByLabelText("Poäng per rätt par"), "0");
    expect(onChange.mock.lastCall?.[0].pointsPerPair).toBe(10);
  });
});
