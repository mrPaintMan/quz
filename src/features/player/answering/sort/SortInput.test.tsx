import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { dragByKeyboard } from "@/features/shared/sortable/dragByKeyboard.setup";
import { SortInput } from "./SortInput";

const shown = { type: "sort" as const, items: ["Avatar", "Titanic", "Oppenheimer"], firstLabel: "Äldst", lastLabel: "Nyast" };

describe("SortInput", () => {
  it("lists the items in the order shown, between the labels", () => {
    render(<SortInput shown={shown} answer={null} imageUrls={{}} disabled={false} onChange={vi.fn()} />);
    expect(screen.getByText("Äldst")).toBeInTheDocument();
    expect(screen.getByText("Nyast")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").map((row) => row.textContent)).toEqual(["1Avatar", "2Titanic", "3Oppenheimer"]);
  });

  it("passes on the new order when an item is dragged", async () => {
    const onChange = vi.fn();
    render(<SortInput shown={shown} answer={null} imageUrls={{}} disabled={false} onChange={onChange} />);
    await dragByKeyboard("Dra för att flytta Titanic", "up");
    expect(onChange).toHaveBeenCalledWith({ type: "sort", order: ["Titanic", "Avatar", "Oppenheimer"] });
  });

  it("shows the team's order so far", () => {
    const answer = { type: "sort" as const, order: ["Oppenheimer", "Avatar", "Titanic"] };
    render(<SortInput shown={shown} answer={answer} imageUrls={{}} disabled={false} onChange={vi.fn()} />);
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("Oppenheimer");
  });

  it("can't be moved once locked", () => {
    render(<SortInput shown={shown} answer={null} imageUrls={{}} disabled onChange={vi.fn()} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Er ordning")).toBeInTheDocument();
  });
});
