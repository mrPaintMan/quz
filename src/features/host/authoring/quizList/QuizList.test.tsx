import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { HostSessionProvider } from "@/features/host/shared/HostSessionProvider";
import { QuizList } from "./QuizList";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const quizzes = vi.fn();
const mutation = vi.fn();
vi.mock("@/features/host/shared/useHostQuery", () => ({ useHostQuery: () => quizzes() }));
vi.mock("@/features/host/shared/useHostMutation", () => ({ useHostMutation: () => mutation }));

const quiz = (title: string, year: number): Doc<"quizzes"> => ({
  _id: title as Id<"quizzes">,
  _creationTime: 0,
  title,
  year,
  updatedAt: Date.now(),
});

function renderList() {
  render(
    <HostSessionProvider session={{ passphrase: "p", logOut: vi.fn() }}>
      <QuizList />
    </HostSessionProvider>,
  );
}

describe("QuizList", () => {
  beforeEach(() => {
    push.mockReset();
    mutation.mockReset();
  });

  it("shows a loading text, then an empty state", () => {
    quizzes.mockReturnValue(undefined);
    renderList();
    expect(screen.getByText("Hämtar quiz…")).toBeInTheDocument();
  });

  it("invites creating the first quiz when there are none", () => {
    quizzes.mockReturnValue([]);
    renderList();
    expect(screen.getByText(/Inga quiz ännu/)).toBeInTheDocument();
  });

  it("opens a newly created quiz", async () => {
    quizzes.mockReturnValue([]);
    mutation.mockResolvedValue("new-quiz");
    renderList();
    await userEvent.click(screen.getByRole("button", { name: "Skapa quiz" }));
    expect(push).toHaveBeenCalledWith("/admin/quizzes/new-quiz");
  });

  it("copies a quiz into next year and opens the copy", async () => {
    quizzes.mockReturnValue([quiz("Julquiz 2026", 2026)]);
    mutation.mockResolvedValue("copy");
    renderList();
    await userEvent.click(screen.getByRole("button", { name: "Kopiera" }));
    expect(mutation).toHaveBeenCalledWith({ quizId: "Julquiz 2026", title: "Julquiz 2027", year: 2027 });
    expect(push).toHaveBeenCalledWith("/admin/quizzes/copy");
  });

  it("deletes a quiz after confirmation", async () => {
    quizzes.mockReturnValue([quiz("Julquiz 2026", 2026)]);
    renderList();
    await userEvent.click(screen.getByRole("button", { name: "Ta bort" }));
    await userEvent.click(await screen.findByRole("button", { name: "Ta bort" }));
    expect(mutation).toHaveBeenCalledWith({ quizId: "Julquiz 2026" });
  });
});
