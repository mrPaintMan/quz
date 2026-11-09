import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type { AnswerOf } from "@convex/answers/answerContent";
import { MatchInput } from "./MatchInput";

const shown = { type: "match" as const, left: ["Dancing Queen", "The Look"], right: ["Roxette", "ABBA"] };
type MatchAnswer = AnswerOf<"match">;

// Passes each change back as the answer, as the answering frame does.
function Answering({ start = null, onChange }: { start?: MatchAnswer | null; onChange: (answer: MatchAnswer) => void }) {
  const [answer, setAnswer] = useState(start);
  return (
    <MatchInput
      shown={shown}
      answer={answer}
      imageUrls={{}}
      disabled={false}
      onChange={(next) => {
        setAnswer(next);
        onChange(next);
      }}
    />
  );
}

describe("MatchInput", () => {
  it("joins an item on the left with one on the right, and draws the line", async () => {
    const onChange = vi.fn();
    const { container } = render(<Answering onChange={onChange} />);
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
    const { container } = render(<Answering start={answer} onChange={onChange} />);
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

  it("follows an answer changed from outside, such as the draft the server locked", () => {
    const { container, rerender } = render(<MatchInput shown={shown} answer={null} imageUrls={{}} disabled={false} onChange={vi.fn()} />);
    rerender(<MatchInput shown={shown} answer={{ type: "match", rightByLeft: ["ABBA", null] }} imageUrls={{}} disabled onChange={vi.fn()} />);
    expect(container.querySelectorAll("line")).toHaveLength(1);
    expect(screen.getByText("1 av 2 par")).toBeInTheDocument();
  });
});
