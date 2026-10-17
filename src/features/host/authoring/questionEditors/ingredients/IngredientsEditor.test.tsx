import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ContentOf } from "@convex/questions/questionContent";
import { IngredientsEditor } from "./IngredientsEditor";

const content: ContentOf<"ingredients"> = { type: "ingredients", items: [{ spellings: ["glögg"] }], pointsPerItem: 1, fuzzy: true };

describe("IngredientsEditor", () => {
  it("edits the ingredients, points and fuzzy matching", async () => {
    const onChange = vi.fn();
    render(<IngredientsEditor content={content} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Ingredienser"), "{enter}apelsin / apelsinjuice");
    expect(onChange.mock.lastCall?.[0].items).toEqual([{ spellings: ["glögg"] }, { spellings: ["apelsin", "apelsinjuice"] }]);
    await userEvent.type(screen.getByLabelText("Poäng per rätt ingrediens"), "0");
    expect(onChange.mock.lastCall?.[0].pointsPerItem).toBe(10);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange.mock.lastCall?.[0].fuzzy).toBe(false);
  });
});
