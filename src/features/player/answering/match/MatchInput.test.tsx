import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MatchInput } from "./MatchInput";

const shown = { type: "match" as const, left: ["Dancing Queen", "The Look"], right: ["Roxette", "ABBA"] };

describe("MatchInput", () => {
  it("joins an item on the left with one on the right, and draws the line", async () => {
    const onChange = vi.fn();
    const { container } = render(<MatchInput shown={shown} answer={null} imageUrls={{}} disabled={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Lista A: Dancing Queen" }));
    await userEvent.click(screen.getByRole("button", { name: "Lista B: ABBA" }));
    expect(onChange).toHaveBeenLastCalledWith({ type: "match", rightByLeft: ["ABBA", null] });
    expect(container.querySelectorAll("line")).toHaveLength(1);
    expect(screen.getByText(/1 av 2 par/)).toBeInTheDocument();
  });

  it("joins starting from the right as well", async () => {
    const onChange = vi.fn();
    render(<MatchInput shown={shown} answer={null} imageUrls={{}} disabled={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Lista B: Roxette" }));
    await userEvent.click(screen.getByRole("button", { name: "Lista A: The Look" }));
    expect(onChange).toHaveBeenLastCalledWith({ type: "match", rightByLeft: [null, "Roxette"] });
  });

  it("marks the item selected until its partner is tapped", async () => {
    render(<MatchInput shown={shown} answer={null} imageUrls={{}} disabled={false} onChange={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Lista A: The Look" }));
    expect(screen.getByRole("button", { name: "Lista A: The Look" })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows the pairs saved so far, and takes a pair apart when an item in it is tapped", async () => {
    const onChange = vi.fn();
    const answer = { type: "match" as const, rightByLeft: ["ABBA", "Roxette"] };
    const { container } = render(<MatchInput shown={shown} answer={answer} imageUrls={{}} disabled={false} onChange={onChange} />);
    expect(container.querySelectorAll("line")).toHaveLength(2);
    await userEvent.click(screen.getByRole("button", { name: "Lista B: ABBA" }));
    expect(onChange).toHaveBeenLastCalledWith({ type: "match", rightByLeft: [null, "Roxette"] });
    expect(container.querySelectorAll("line")).toHaveLength(1);
  });

  it("can't change once locked", () => {
    render(<MatchInput shown={shown} answer={null} imageUrls={{}} disabled onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Lista A: Dancing Queen" })).toBeDisabled();
    expect(screen.getByText("0 av 2 par")).toBeInTheDocument();
  });
});
