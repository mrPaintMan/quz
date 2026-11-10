import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type { AnswerOf } from "@convex/answers/answerContent";
import { FreeTextInput } from "./FreeTextInput";

const twoFields = { type: "freeText" as const, labels: ["Artist", "Låt"] };

// Passes each change back as the answer, as the answering frame does.
function Answering({ onChange }: { onChange: (answer: AnswerOf<"freeText">) => void }) {
  const [answer, setAnswer] = useState<AnswerOf<"freeText"> | null>(null);
  return (
    <FreeTextInput
      shown={twoFields}
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

describe("FreeTextInput", () => {
  it("gives one titled field per sub-question and passes on what is written in each", async () => {
    const onChange = vi.fn();
    render(<Answering onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("b) Låt"), "Waterloo");
    expect(onChange).toHaveBeenLastCalledWith({ type: "freeText", fields: ["", "Waterloo"] });
    expect(screen.getByText("Ni kan lämna ett fält tomt.")).toBeInTheDocument();
  });

  it("calls a single field Ert svar", () => {
    render(<FreeTextInput shown={{ type: "freeText", labels: [""] }} answer={{ type: "freeText", fields: ["Kanel"] }} imageUrls={{}} disabled={false} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Ert svar")).toHaveValue("Kanel");
    expect(screen.queryByText("Ni kan lämna ett fält tomt.")).not.toBeInTheDocument();
  });

  it("can't change once locked", () => {
    render(<FreeTextInput shown={twoFields} answer={null} imageUrls={{}} disabled onChange={vi.fn()} />);
    expect(screen.getByLabelText("a) Artist")).toBeDisabled();
    expect(screen.queryByText("Ni kan lämna ett fält tomt.")).not.toBeInTheDocument();
  });

  it("keeps one field per sub-question when the hosts add one while the question shows", async () => {
    const onChange = vi.fn();
    const shown = { type: "freeText" as const, labels: ["Artist", "Låt", "År"] };
    render(<FreeTextInput shown={shown} answer={{ type: "freeText", fields: ["ABBA", "Waterloo"] }} imageUrls={{}} disabled={false} onChange={onChange} />);
    expect(screen.getAllByRole("textbox").map((field) => (field as HTMLInputElement).value)).toEqual(["ABBA", "Waterloo", ""]);
    await userEvent.type(screen.getByLabelText("c) År"), "1");
    expect(onChange).toHaveBeenLastCalledWith({ type: "freeText", fields: ["ABBA", "Waterloo", "1"] });
  });
});
