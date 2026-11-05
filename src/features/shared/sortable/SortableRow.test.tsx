import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SortableRow } from "./SortableRow";

describe("SortableRow", () => {
  it("renders a list row and hands its children a drag handle named after the row", () => {
    render(
      <DndContext>
        <SortableContext items={["a"]}>
          <ul>
            <SortableRow id="a" name="omgång 1" className="rad">
              {(dragHandle) => (
                <>
                  {dragHandle}
                  <span>Julmat</span>
                </>
              )}
            </SortableRow>
          </ul>
        </SortableContext>
      </DndContext>,
    );
    expect(screen.getByRole("listitem")).toHaveClass("rad");
    expect(screen.getByRole("button", { name: "Dra för att flytta omgång 1" })).toBeInTheDocument();
    expect(screen.getByText("Julmat")).toBeInTheDocument();
  });
});
