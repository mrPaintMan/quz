import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RowButtons } from "./RowButtons";
import { SortableList } from "./SortableList";

function renderList(items: string[], onMove: (fromIndex: number, toIndex: number) => unknown) {
  return render(
    <SortableList
      items={items}
      getId={(item) => item}
      nameOf={(index) => `sak ${index + 1}`}
      onMove={onMove}
      itemClassName={(item) => `rad-${item}`}
      renderItem={(item, { index, dragHandle, position }) => (
        <>
          {dragHandle}
          <span>{item}</span>
          <RowButtons name={`sak ${index + 1}`} position={position} />
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

  it("moves a row with the arrows", async () => {
    const onMove = vi.fn();
    renderList(["A", "B", "C"], onMove);
    await userEvent.click(screen.getByRole("button", { name: "Flytta ned sak 1" }));
    expect(onMove).toHaveBeenCalledWith(0, 1);
  });

  it("shows the new order until a slow move settles, then follows the items again", async () => {
    let settle = () => {};
    const onMove = vi.fn(() => new Promise<void>((resolve) => (settle = resolve)));
    renderList(["A", "B"], onMove);
    await userEvent.click(screen.getByRole("button", { name: "Flytta upp sak 2" }));
    expect(shownOrder()).toEqual(["B", "A"]);
    await act(async () => settle());
    // The items prop never changed here, as when the server refuses the move.
    expect(shownOrder()).toEqual(["A", "B"]);
  });
});
