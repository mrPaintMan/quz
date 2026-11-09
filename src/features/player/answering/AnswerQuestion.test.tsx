import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConvexError } from "convex/values";
import { getFunctionName, type FunctionReference } from "convex/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { AnswerQuestion } from "./AnswerQuestion";
import { DRAFT_SAVE_DELAY_MS } from "./useDraftSaver";

const saved = vi.fn();
const mutations = { saveAnswerDraft: vi.fn(), sendAnswer: vi.fn() };
vi.mock("convex/react", () => ({
  useQuery: () => saved(),
  // The generated api hands out a new reference on each access, so pick by name.
  useMutation: (mutation: FunctionReference<"mutation">) => mutations[getFunctionName(mutation).split(":")[1] as keyof typeof mutations],
}));

const teamId = "t1" as Id<"teams">;
const questionId = "q1" as Id<"questions">;
const shown = {
  type: "multipleChoice" as const,
  options: [
    { text: "Sverige", imageId: null },
    { text: "Norge", imageId: null },
  ],
};
const norway = { type: "multipleChoice", optionIndex: 1 };

const renderAnswer = (secondsLeft: number | null = null) =>
  render(<AnswerQuestion teamId={teamId} questionId={questionId} shown={shown} imageUrls={{}} secondsLeft={secondsLeft} />);
// Clicks with simulated time, so the draft's second can be stepped over without waiting.
const user = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
const waitForDraftSave = () => act(() => vi.advanceTimersByTime(DRAFT_SAVE_DELAY_MS));

describe("AnswerQuestion", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    saved.mockReturnValue(null);
    Object.values(mutations).forEach((mutation) => mutation.mockReset().mockResolvedValue(null));
  });

  afterEach(() => vi.useRealTimers());

  it("saves a pick as a draft once the team pauses, and sends the answer", async () => {
    renderAnswer();
    expect(screen.getByRole("button", { name: "Skicka svar" })).toBeDisabled();
    await user().click(screen.getByRole("button", { name: "B Norge" }));
    expect(mutations.saveAnswerDraft).not.toHaveBeenCalled();
    await waitForDraftSave();
    expect(mutations.saveAnswerDraft).toHaveBeenCalledWith({ teamId, questionId, content: norway });
    await user().click(screen.getByRole("button", { name: "Skicka svar" }));
    expect(mutations.sendAnswer).toHaveBeenCalledWith({ teamId, questionId, content: norway });
  });

  it("saves at once when the time is nearly out, so the lock at zero finds the change", async () => {
    renderAnswer(2);
    await user().click(screen.getByRole("button", { name: "B Norge" }));
    expect(mutations.saveAnswerDraft).toHaveBeenCalledWith({ teamId, questionId, content: norway });
  });

  it("picks up a draft saved earlier, such as before a reload", () => {
    saved.mockReturnValue({ content: { type: "multipleChoice", optionIndex: 0 }, isLocked: false });
    renderAnswer();
    expect(screen.getByRole("button", { name: "A Sverige" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Skicka svar" })).toBeEnabled();
  });

  it("shows a locked answer as sent, and no longer lets it change", () => {
    saved.mockReturnValue({ content: { type: "multipleChoice", optionIndex: 0 }, isLocked: true });
    renderAnswer();
    expect(screen.getByText("Svar skickat ✓")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "A Sverige" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Skicka svar" })).not.toBeInTheDocument();
  });

  it("lets nothing change once the time is out", () => {
    saved.mockReturnValue({ content: { type: "multipleChoice", optionIndex: 0 }, isLocked: false });
    renderAnswer(0);
    expect(screen.getByRole("button", { name: "A Sverige" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Skicka svar" })).toBeDisabled();
  });

  it("says why the server refused the answer", async () => {
    mutations.sendAnswer.mockRejectedValue(new ConvexError("Tiden är ute."));
    renderAnswer();
    await user().click(screen.getByRole("button", { name: "A Sverige" }));
    await user().click(screen.getByRole("button", { name: "Skicka svar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Tiden är ute.");
  });

  it("shows nothing when a draft can't be saved, and keeps the team's pick", async () => {
    mutations.saveAnswerDraft.mockRejectedValue(new ConvexError("Tiden är ute."));
    renderAnswer();
    await user().click(screen.getByRole("button", { name: "B Norge" }));
    await waitForDraftSave();
    expect(mutations.saveAnswerDraft).toHaveBeenCalled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "B Norge" })).toHaveAttribute("aria-pressed", "true");
  });

  it("drops the waiting draft once the answer is sent", async () => {
    renderAnswer();
    await user().click(screen.getByRole("button", { name: "B Norge" }));
    await user().click(screen.getByRole("button", { name: "Skicka svar" }));
    await waitForDraftSave();
    expect(mutations.saveAnswerDraft).not.toHaveBeenCalled();
  });

  it("keeps the waiting draft as the fallback when sending fails", async () => {
    mutations.sendAnswer.mockRejectedValue(new ConvexError("Något gick fel."));
    renderAnswer();
    await user().click(screen.getByRole("button", { name: "B Norge" }));
    await user().click(screen.getByRole("button", { name: "Skicka svar" }));
    await waitForDraftSave();
    expect(mutations.saveAnswerDraft).toHaveBeenCalledWith({ teamId, questionId, content: norway });
  });

  it("can't be sent twice while sending", async () => {
    let finish: () => void = () => {};
    mutations.sendAnswer.mockReturnValue(new Promise<void>((resolve) => (finish = resolve)));
    saved.mockReturnValue({ content: { type: "multipleChoice", optionIndex: 0 }, isLocked: false });
    renderAnswer();
    await user().click(screen.getByRole("button", { name: "Skicka svar" }));
    expect(screen.getByRole("button", { name: "Skicka svar" })).toBeDisabled();
    await act(async () => finish());
  });

  it("shows nothing while the team's answer loads", () => {
    saved.mockReturnValue(undefined);
    const { container } = renderAnswer();
    expect(container).toBeEmptyDOMElement();
  });

  it("says when the time ran out with nothing saved", () => {
    renderAnswer(0);
    expect(screen.getByText("Inget svar sparades.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Skicka svar" })).not.toBeInTheDocument();
  });

  it("can send the order a sort question starts from, without a draft", async () => {
    const sortShown = { type: "sort" as const, items: ["Avatar", "Titanic"], firstLabel: "Äldst", lastLabel: "Nyast" };
    render(<AnswerQuestion teamId={teamId} questionId={questionId} shown={sortShown} imageUrls={{}} secondsLeft={null} />);
    await user().click(screen.getByRole("button", { name: "Skicka svar" }));
    expect(mutations.sendAnswer).toHaveBeenCalledWith({ teamId, questionId, content: { type: "sort", order: ["Avatar", "Titanic"] } });
    expect(mutations.saveAnswerDraft).not.toHaveBeenCalled();
  });
});
