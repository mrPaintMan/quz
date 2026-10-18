import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RowButtons } from "./RowButtons";

describe("RowButtons", () => {
  it("shows only the actions it is given, with labels naming the row", async () => {
    const onRemove = vi.fn();
    render(<RowButtons name="par 2" onRemove={onRemove} />);
    expect(screen.queryByRole("button", { name: /Flytta/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Ta bort par 2" }));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("moves the row up and down", async () => {
    const onMove = vi.fn();
    render(<RowButtons name="sak 2" position={{ index: 1, count: 3, onMove }} />);
    await userEvent.click(screen.getByRole("button", { name: "Flytta upp sak 2" }));
    await userEvent.click(screen.getByRole("button", { name: "Flytta ned sak 2" }));
    expect(onMove.mock.calls).toEqual([[0], [2]]);
  });

  it("disables the arrow that would move the first or last row out of the list", () => {
    const { rerender } = render(<RowButtons name="sak 1" position={{ index: 0, count: 2, onMove: vi.fn() }} />);
    expect(screen.getByRole("button", { name: "Flytta upp sak 1" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Flytta ned sak 1" })).toBeEnabled();
    rerender(<RowButtons name="sak 2" position={{ index: 1, count: 2, onMove: vi.fn() }} />);
    expect(screen.getByRole("button", { name: "Flytta upp sak 2" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Flytta ned sak 2" })).toBeDisabled();
  });
});
