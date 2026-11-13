import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AnswerOf } from "@convex/answers/answerContent";
import { PaSparetInput } from "./PaSparetInput";

type Guess = AnswerOf<"paSparet">;
const film = { playback: { kind: "paused" as const, positionMs: 50_000 }, durationSeconds: 100 };

function renderInput(answer: Guess | null, { disabled = false, onChange = vi.fn(), onSend = vi.fn() } = {}) {
  render(<PaSparetInput shown={{ type: "paSparet" }} answer={answer} imageUrls={{}} disabled={disabled} onChange={onChange} onSend={onSend} film={film} />);
  return { onChange, onSend };
}
const pullBrake = () => fireEvent.keyDown(screen.getByRole("slider"), { key: "Enter" });

describe("PaSparetInput", () => {
  it("shows what a brake is worth now, from where the film is", () => {
    renderInput(null);
    expect(screen.getByText("6 poäng")).toBeInTheDocument();
  });

  it("writes the guess, never with a brake of its own", async () => {
    const { onChange } = renderInput(null);
    await userEvent.type(screen.getByLabelText("Vart är vi på väg?"), "K");
    expect(onChange).toHaveBeenCalledWith({ type: "paSparet", guess: "K", brakeClueIndex: null });
  });

  it("sends the guess when the brake is pulled", () => {
    const { onSend } = renderInput({ type: "paSparet", guess: "Kiruna", brakeClueIndex: null });
    pullBrake();
    expect(onSend).toHaveBeenCalledWith({ type: "paSparet", guess: "Kiruna", brakeClueIndex: null });
  });

  it("asks for a guess before the brake can be pulled", () => {
    const { onSend } = renderInput({ type: "paSparet", guess: "  ", brakeClueIndex: null });
    pullBrake();
    expect(onSend).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Skriv ett svar innan ni drar i nödbromsen");
  });

  it("shows the guess locked by the brake, with the points it was pulled at", () => {
    renderInput({ type: "paSparet", guess: "Kiruna", brakeClueIndex: 2 }, { disabled: true });
    expect(screen.getByText("Ni drog i nödbromsen")).toBeInTheDocument();
    expect(screen.getByText("Kiruna")).toBeInTheDocument();
    expect(screen.getByText("på 6 poäng")).toBeInTheDocument();
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
  });

  it("says when a locked guess never braked", () => {
    renderInput({ type: "paSparet", guess: "Kiruna", brakeClueIndex: null }, { disabled: true });
    expect(screen.getByText("Ni bromsade inte.")).toBeInTheDocument();
  });

  it("leaves a time-out with nothing written to the phone's own line", () => {
    const { container } = render(<PaSparetInput shown={{ type: "paSparet" }} answer={null} imageUrls={{}} disabled onChange={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("can't be pulled with nothing to send it with", () => {
    render(<PaSparetInput shown={{ type: "paSparet" }} answer={{ type: "paSparet", guess: "Kiruna", brakeClueIndex: null }} imageUrls={{}} disabled={false} onChange={vi.fn()} />);
    pullBrake();
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "0");
  });
});
