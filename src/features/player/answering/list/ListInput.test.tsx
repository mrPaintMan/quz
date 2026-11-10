import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type { AnswerOf } from "@convex/answers/answerContent";
import { MAX_LIST_ITEMS } from "@/domain/questionTypes/list/listAnswering";
import { ListInput } from "./ListInput";

const shown = { type: "list" as const };

// Passes each change back as the answer, as the answering frame does.
function Answering({ onChange, start = null }: { onChange: (answer: AnswerOf<"list">) => void; start?: AnswerOf<"list"> | null }) {
  const [answer, setAnswer] = useState<AnswerOf<"list"> | null>(start);
  return (
    <ListInput
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

const listed = () => screen.getAllByRole("listitem").map((item) => item.firstChild?.textContent);

describe("ListInput", () => {
  it("adds answers one at a time, by Enter or the button, newest first", async () => {
    const onChange = vi.fn();
    render(<Answering onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Nytt svar"), " Oslo {Enter}");
    await userEvent.type(screen.getByLabelText("Nytt svar"), "Bergen");
    await userEvent.click(screen.getByRole("button", { name: "Lägg till" }));
    expect(onChange).toHaveBeenLastCalledWith({ type: "list", items: ["Oslo", "Bergen"] });
    expect(listed()).toEqual(["Bergen", "Oslo"]);
    expect(screen.getByText("2 svar")).toBeInTheDocument();
    expect(screen.getByLabelText("Nytt svar")).toHaveValue("");
    expect(screen.getByLabelText("Nytt svar")).toHaveFocus();
  });

  it("refuses an answer already on the list, however it is written, and adds nothing blank", async () => {
    const onChange = vi.fn();
    render(<Answering onChange={onChange} start={{ type: "list", items: ["Oslo"] }} />);
    await userEvent.type(screen.getByLabelText("Nytt svar"), "oslo.{Enter}");
    expect(screen.getByRole("alert")).toHaveTextContent("Det finns redan.");
    await userEvent.clear(screen.getByLabelText("Nytt svar"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Nytt svar"), "   {Enter}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("refuses more answers once the list is full", async () => {
    const onChange = vi.fn();
    const full = Array.from({ length: MAX_LIST_ITEMS }, (_, index) => `Svar ${index}`);
    render(<Answering onChange={onChange} start={{ type: "list", items: full }} />);
    await userEvent.type(screen.getByLabelText("Nytt svar"), "Ett till{Enter}");
    expect(screen.getByRole("alert")).toHaveTextContent(`Listan är full med ${MAX_LIST_ITEMS} svar.`);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("adds what is typed when the field loses focus, so a last answer isn't lost", async () => {
    const onChange = vi.fn();
    render(<Answering onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Nytt svar"), "Uppsala");
    await userEvent.click(document.body);
    expect(onChange).toHaveBeenLastCalledWith({ type: "list", items: ["Uppsala"] });
  });

  it("removes an answer", async () => {
    const onChange = vi.fn();
    render(<Answering onChange={onChange} start={{ type: "list", items: ["Oslo", "Bergen"] }} />);
    await userEvent.click(screen.getByRole("button", { name: "Ta bort Oslo" }));
    expect(onChange).toHaveBeenLastCalledWith({ type: "list", items: ["Bergen"] });
  });

  it("can't change once locked", () => {
    render(<ListInput shown={shown} answer={{ type: "list", items: ["Oslo"] }} imageUrls={{}} disabled onChange={vi.fn()} />);
    expect(screen.queryByLabelText("Nytt svar")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ta bort Oslo" })).not.toBeInTheDocument();
    expect(screen.getByText("1 svar")).toBeInTheDocument();
    expect(screen.queryByText("Bara tillagda svar räknas.")).not.toBeInTheDocument();
  });
});
