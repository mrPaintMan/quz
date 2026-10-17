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
    const onMoveUp = vi.fn();
    const onMoveDown = vi.fn();
    render(<RowButtons name="sak 1" onMoveUp={onMoveUp} onMoveDown={onMoveDown} />);
    await userEvent.click(screen.getByRole("button", { name: "Flytta upp sak 1" }));
    await userEvent.click(screen.getByRole("button", { name: "Flytta ned sak 1" }));
    expect(onMoveUp).toHaveBeenCalledOnce();
    expect(onMoveDown).toHaveBeenCalledOnce();
  });
});
