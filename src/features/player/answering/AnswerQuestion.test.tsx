import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConvexError } from "convex/values";
import { getFunctionName, type FunctionReference } from "convex/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { AnswerQuestion } from "./AnswerQuestion";

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

const renderAnswer = (isTimeOut = false) =>
  render(<AnswerQuestion teamId={teamId} questionId={questionId} shown={shown} imageUrls={{}} isTimeOut={isTimeOut} />);

describe("AnswerQuestion", () => {
  beforeEach(() => {
    saved.mockReturnValue(null);
    Object.values(mutations).forEach((mutation) => mutation.mockReset().mockResolvedValue(null));
  });

  it("saves each pick as a draft and sends the answer", async () => {
    renderAnswer();
    expect(screen.getByRole("button", { name: "Skicka svar" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "B Norge" }));
    const content = { type: "multipleChoice", optionIndex: 1 };
    // Drafts wait for the team to pause (useDraftSaver).
    await waitFor(() => expect(mutations.saveAnswerDraft).toHaveBeenCalledWith({ teamId, questionId, content }), { timeout: 2000 });
    await userEvent.click(screen.getByRole("button", { name: "Skicka svar" }));
    expect(mutations.sendAnswer).toHaveBeenCalledWith({ teamId, questionId, content });
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
    renderAnswer(true);
    expect(screen.getByRole("button", { name: "A Sverige" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Skicka svar" })).toBeDisabled();
  });

  it("says why the server refused the answer", async () => {
    mutations.sendAnswer.mockRejectedValue(new ConvexError("Tiden är ute."));
    renderAnswer();
    await userEvent.click(screen.getByRole("button", { name: "A Sverige" }));
    await userEvent.click(screen.getByRole("button", { name: "Skicka svar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Tiden är ute.");
  });

  it("shows nothing while the team's answer loads", () => {
    saved.mockReturnValue(undefined);
    const { container } = renderAnswer();
    expect(container).toBeEmptyDOMElement();
  });

  it("shows nothing when a draft can't be saved, and keeps the team's pick", async () => {
    mutations.saveAnswerDraft.mockRejectedValue(new ConvexError("Tiden är ute."));
    renderAnswer();
    await userEvent.click(screen.getByRole("button", { name: "B Norge" }));
    await waitFor(() => expect(mutations.saveAnswerDraft).toHaveBeenCalled(), { timeout: 2000 });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "B Norge" })).toHaveAttribute("aria-pressed", "true");
  });

  it("can't be sent twice while sending", async () => {
    let finish: () => void = () => {};
    mutations.sendAnswer.mockReturnValue(new Promise<void>((resolve) => (finish = resolve)));
    saved.mockReturnValue({ content: { type: "multipleChoice", optionIndex: 0 }, isLocked: false });
    renderAnswer();
    await userEvent.click(screen.getByRole("button", { name: "Skicka svar" }));
    expect(screen.getByRole("button", { name: "Skicka svar" })).toBeDisabled();
    finish();
  });

  it("doesn't save a waiting draft over the answer it sends", async () => {
    renderAnswer();
    await userEvent.click(screen.getByRole("button", { name: "B Norge" }));
    await userEvent.click(screen.getByRole("button", { name: "Skicka svar" }));
    await new Promise((resolve) => setTimeout(resolve, 1100));
    expect(mutations.saveAnswerDraft).not.toHaveBeenCalled();
  });
});
