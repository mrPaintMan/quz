import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ContentOf } from "@convex/questions/questionContent";
import { ListEditor } from "./ListEditor";

const content: ContentOf<"list"> = { type: "list", acceptedItems: [], pointsPerItem: 1, fuzzy: true, aiAssist: false };

describe("ListEditor", () => {
  it("edits the answer key, points and both switches", async () => {
    const onChange = vi.fn();
    render(<ListEditor content={content} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Facit (valfritt)"), "Oslo");
    expect(onChange.mock.lastCall?.[0].acceptedItems).toEqual([{ spellings: ["Oslo"] }]);
    await userEvent.type(screen.getByLabelText("Poäng per rätt svar"), "0");
    expect(onChange.mock.lastCall?.[0].pointsPerItem).toBe(10);
    await userEvent.click(screen.getByRole("switch", { name: "Rätta med ungefärlig matchning" }));
    expect(onChange.mock.lastCall?.[0].fuzzy).toBe(false);
    await userEvent.click(screen.getByRole("switch", { name: "Låt AI föreslå rättning" }));
    expect(onChange.mock.lastCall?.[0].aiAssist).toBe(true);
  });
});
