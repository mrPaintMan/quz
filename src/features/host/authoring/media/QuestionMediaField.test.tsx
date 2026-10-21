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
const uploadFilm = vi.fn();
vi.mock("./useUploadFilm", () => ({ useUploadFilm: () => uploadFilm }));
const readVideoFacts = vi.fn();
vi.mock("./readVideoFacts", () => ({ readVideoFacts: (file: Blob) => readVideoFacts(file) }));
const still = new Blob(["jpeg"], { type: "image/jpeg" });

const trip: Doc<"questions">["content"] = { type: "paSparet", acceptedAnswers: [], fuzzy: true, clues: ["", "", "", "", ""] };

const question = (media: Doc<"questions">["media"], content: Doc<"questions">["content"] = { type: "activity", maxPoints: 1 }): Doc<"questions"> => ({
  _id: "q1" as Id<"questions">,
  _creationTime: 0,
  quizId: "quiz" as Id<"quizzes">,
  roundId: "round" as Id<"rounds">,
  position: 0,
  prompt: "",
  timeLimitSeconds: null,
  media,
  hostNotes: "",
  content,
});

function chooseFile(container: HTMLElement, file: File) {
  fireEvent.change(container.querySelector('input[type="file"]') as HTMLInputElement, { target: { files: [file] } });
}

describe("QuestionMediaField", () => {
  beforeEach(() => {
    mutation.mockReset().mockResolvedValue(undefined);
    uploadFile.mockReset().mockImplementation(async (file: Blob) => (file === still ? "still1" : "file1"));
    uploadFilm.mockReset().mockResolvedValue("film-key");
    readVideoFacts.mockReset().mockResolvedValue({ still, durationSeconds: 120 });
  });

  it("uploads a file and attaches it with its kind", async () => {
    const { container } = render(<QuestionMediaField question={question(null)} />);
    chooseFile(container, new File(["x"], "jul.mp3", { type: "audio/mpeg" }));
    await vi.waitFor(() =>
      expect(mutation).toHaveBeenCalledWith({ questionId: "q1", media: { kind: "audio", storageId: "file1" } }),
    );
    expect(readVideoFacts).not.toHaveBeenCalled();
  });

  it("uploads a film with a still and its length read from the file", async () => {
    const { container } = render(<QuestionMediaField question={question(null)} />);
    chooseFile(container, new File(["x"], "tag.mp4", { type: "video/mp4" }));
    await vi.waitFor(() =>
      expect(mutation).toHaveBeenCalledWith({
        questionId: "q1",
        media: { kind: "video", r2Key: "film-key", posterId: "still1", durationSeconds: 120 },
      }),
    );
  });

  it("uploads a film without a still when the browser can't read one", async () => {
    readVideoFacts.mockResolvedValue({ still: null, durationSeconds: null });
    const { container } = render(<QuestionMediaField question={question(null)} />);
    chooseFile(container, new File(["x"], "tag.mov", { type: "video/quicktime" }));
    await vi.waitFor(() =>
      expect(mutation).toHaveBeenCalledWith({
        questionId: "q1",
        media: { kind: "video", r2Key: "film-key", posterId: null, durationSeconds: null },
      }),
    );
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it("saves the film without a still when only the still fails to upload", async () => {
    uploadFile.mockImplementation(async (file: Blob) => {
      if (file === still) throw new Error("offline");
      return "other";
    });
    const { container } = render(<QuestionMediaField question={question(null)} />);
    chooseFile(container, new File(["x"], "tag.mp4", { type: "video/mp4" }));
    await vi.waitFor(() =>
      expect(mutation).toHaveBeenCalledWith({
        questionId: "q1",
        media: { kind: "video", r2Key: "film-key", posterId: null, durationSeconds: 120 },
      }),
    );
  });

  it("takes only a film for a På spåret trip, with export advice", async () => {
    const { container } = render(<QuestionMediaField question={question(null, trip)} />);
    expect(screen.getByRole("heading", { name: "Filmen" })).toBeInTheDocument();
    expect(screen.getByText(/1080p, 30 bilder per sekund/)).toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).toHaveAttribute("accept", "video/*");
    chooseFile(container, new File(["x"], "karta.png", { type: "image/png" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it("shows an attached film by its still", () => {
    const media = { kind: "video" as const, r2Key: "film-key", posterId: "still1" as Id<"_storage">, durationSeconds: 120 };
    render(<QuestionMediaField question={question(media, trip)} />);
    expect(screen.getByRole("img", { name: "Stillbild ur filmen" })).toBeInTheDocument();
    expect(screen.getByText("Längd 2:00")).toBeInTheDocument();
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
