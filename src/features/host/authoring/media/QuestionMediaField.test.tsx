import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { QuestionMediaField } from "./QuestionMediaField";

const mutation = vi.fn();
const uploadFile = vi.fn();
vi.mock("@/features/host/shared/useHostMutation", () => ({ useHostMutation: () => mutation }));
vi.mock("@/features/host/shared/useHostQuery", () => ({ useHostQuery: () => "https://file.example" }));
vi.mock("./useUploadFile", () => ({ useUploadFile: () => uploadFile }));

const question = (media: Doc<"questions">["media"]): Doc<"questions"> => ({
  _id: "q1" as Id<"questions">,
  _creationTime: 0,
  quizId: "quiz" as Id<"quizzes">,
  roundId: "round" as Id<"rounds">,
  position: 0,
  prompt: "",
  timeLimitSeconds: null,
  media,
  hostNotes: "",
  content: { type: "activity", maxPoints: 1 },
});

function chooseFile(container: HTMLElement, file: File) {
  fireEvent.change(container.querySelector('input[type="file"]') as HTMLInputElement, { target: { files: [file] } });
}

describe("QuestionMediaField", () => {
  beforeEach(() => {
    mutation.mockReset().mockResolvedValue(undefined);
    uploadFile.mockReset().mockResolvedValue("file1");
  });

  it("uploads a file and attaches it with its kind", async () => {
    const { container } = render(<QuestionMediaField question={question(null)} />);
    chooseFile(container, new File(["x"], "jul.mp3", { type: "audio/mpeg" }));
    await vi.waitFor(() =>
      expect(mutation).toHaveBeenCalledWith({ questionId: "q1", kind: "audio", storageId: "file1" }),
    );
  });

  it("refuses files that aren't image, audio or video", async () => {
    const { container } = render(<QuestionMediaField question={question(null)} />);
    chooseFile(container, new File(["x"], "regler.pdf", { type: "application/pdf" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it("shows attached media and can remove it", async () => {
    render(<QuestionMediaField question={question({ kind: "image", storageId: "file1" as Id<"_storage"> })} />);
    expect(screen.getByRole("img", { name: "Frågans media" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Ta bort fil" }));
    expect(mutation).toHaveBeenCalledWith({ questionId: "q1" });
  });
});
