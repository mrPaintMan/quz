import { act, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { dragByKeyboard } from "./dragByKeyboard.setup";
import { SortableList } from "./SortableList";

function renderList(items: string[], onMove: (item: string, fromIndex: number, toIndex: number) => unknown) {
  return render(
    <SortableList
      items={items}
      getId={(item) => item}
      nameOf={(index) => `sak ${index + 1}`}
      onMove={onMove}
      itemClassName={(item) => `rad-${item}`}
      renderItem={(item, { dragHandle }) => (
        <>
          {dragHandle}
          <span>{item}</span>
        </>
      )}
    />,
  );
}

const shownOrder = () => screen.getAllByRole("listitem").map((row) => within(row).getByText(/^[A-Z]$/).textContent);

describe("SortableList", () => {
  it("renders each item as a list row with a drag handle named after it", () => {
    renderList(["A", "B"], vi.fn());
    expect(shownOrder()).toEqual(["A", "B"]);
    expect(screen.getAllByRole("listitem")[1]).toHaveClass("rad-B");
    expect(screen.getByRole("button", { name: "Dra för att flytta sak 2" })).toBeInTheDocument();
  });

  it("moves a row dragged by its handle", async () => {
    const onMove = vi.fn();
    renderList(["A", "B", "C"], onMove);
    await dragByKeyboard("Dra för att flytta sak 2", "down");
    expect(onMove).toHaveBeenCalledWith("B", 1, 2);
  });

  it("shows the new order until a slow move settles, then follows the items again", async () => {
    let settle = () => {};
    const onMove = vi.fn(() => new Promise<void>((resolve) => (settle = resolve)));
    renderList(["A", "B"], onMove);
    await dragByKeyboard("Dra för att flytta sak 2", "up");
    expect(shownOrder()).toEqual(["B", "A"]);
    await act(async () => settle());
    // The items prop never changed here, as when the server refuses the move.
    expect(shownOrder()).toEqual(["A", "B"]);
  });

  it("hands over the moved item itself, also for a second move while the first is pending", async () => {
    const onMove = vi.fn(() => new Promise<void>(() => {}));
    renderList(["A", "B", "C"], onMove);
    await dragByKeyboard("Dra för att flytta sak 1", "down");
    // Shown order is now B, A, C; row 1 is B even though the items prop still starts with A.
    await dragByKeyboard("Dra för att flytta sak 1", "down");
    expect(onMove.mock.calls).toEqual([
      ["A", 0, 1],
      ["B", 0, 1],
    ]);
  });
});
