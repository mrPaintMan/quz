import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type { AnswerOf } from "@convex/answers/answerContent";
import { IngredientsInput } from "./IngredientsInput";

const shown = { type: "ingredients" as const, count: 3 };

// Passes each change back as the answer, as the answering frame does.
function Answering({ onChange }: { onChange: (answer: AnswerOf<"ingredients">) => void }) {
  const [answer, setAnswer] = useState<AnswerOf<"ingredients"> | null>(null);
  return (
    <IngredientsInput
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

describe("IngredientsInput", () => {
  it("gives one field per ingredient and passes on what is written in each", async () => {
    const onChange = vi.fn();
    render(<Answering onChange={onChange} />);
    expect(screen.getAllByRole("textbox")).toHaveLength(3);
    await userEvent.type(screen.getByLabelText("Ingrediens 2"), "Kanel");
    expect(onChange).toHaveBeenLastCalledWith({ type: "ingredients", items: ["", "Kanel", ""] });
    expect(screen.getByText("1 av 3 ifyllda")).toBeInTheDocument();
  });

  it("shows what the team has written so far", () => {
    render(<IngredientsInput shown={shown} answer={{ type: "ingredients", items: ["Vodka", "", "Grädde"] }} imageUrls={{}} disabled={false} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Ingrediens 3")).toHaveValue("Grädde");
    expect(screen.getByText("2 av 3 ifyllda")).toBeInTheDocument();
  });

  it("can't change once locked", () => {
    render(<IngredientsInput shown={shown} answer={null} imageUrls={{}} disabled onChange={vi.fn()} />);
    expect(screen.getByLabelText("Ingrediens 1")).toBeDisabled();
    expect(screen.queryByText("Tomma rader är okej.")).not.toBeInTheDocument();
  });

  it("keeps one field per ingredient when the hosts change how many while the question shows", () => {
    render(<IngredientsInput shown={{ type: "ingredients", count: 4 }} answer={{ type: "ingredients", items: ["Vodka", "", ""] }} imageUrls={{}} disabled={false} onChange={vi.fn()} />);
    expect(screen.getAllByRole("textbox")).toHaveLength(4);
  });
});
