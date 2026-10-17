import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ContentOf } from "@convex/questions/questionContent";
import { SortEditor } from "./SortEditor";

const content: ContentOf<"sort"> = {
  type: "sort",
  items: ["Kalle Anka", "Ensam hemma"],
  firstLabel: "Äldst",
  lastLabel: "Nyast",
  pointsPerItem: 1,
};

describe("SortEditor", () => {
  it("edits, reorders, adds and removes items", async () => {
    const onChange = vi.fn();
    render(<SortEditor content={content} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Sak 2"), "!");
    expect(onChange.mock.lastCall?.[0].items).toEqual(["Kalle Anka", "Ensam hemma!"]);
    expect(screen.queryByRole("button", { name: "Flytta upp sak 1" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Flytta ned sak 1" }));
    expect(onChange.mock.lastCall?.[0].items).toEqual(["Ensam hemma", "Kalle Anka"]);
    await userEvent.click(screen.getByRole("button", { name: "Flytta upp sak 2" }));
    expect(onChange.mock.lastCall?.[0].items).toEqual(["Ensam hemma", "Kalle Anka"]);
    await userEvent.click(screen.getByRole("button", { name: "Lägg till sak" }));
    expect(onChange.mock.lastCall?.[0].items).toHaveLength(3);
    await userEvent.click(screen.getByRole("button", { name: "Ta bort sak 1" }));
    expect(onChange.mock.lastCall?.[0].items).toEqual(["Ensam hemma"]);
  });

  it("edits the end labels and points", async () => {
    const onChange = vi.fn();
    render(<SortEditor content={content} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Början betyder"), "a");
    expect(onChange.mock.lastCall?.[0].firstLabel).toBe("Äldsta");
    await userEvent.type(screen.getByLabelText("Slutet betyder"), "e");
    expect(onChange.mock.lastCall?.[0].lastLabel).toBe("Nyaste");
    await userEvent.type(screen.getByLabelText("Poäng per rätt placering"), "0");
    expect(onChange.mock.lastCall?.[0].pointsPerItem).toBe(10);
  });
});
