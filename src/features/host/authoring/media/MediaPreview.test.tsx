import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { MediaPreview } from "./MediaPreview";

const url = vi.fn();
vi.mock("@/features/host/shared/useHostQuery", () => ({ useHostQuery: () => url() }));

const storageId = "file1" as Id<"_storage">;

describe("MediaPreview", () => {
  it("says it is loading until the URL arrives", () => {
    url.mockReturnValue(undefined);
    render(<MediaPreview storageId={storageId} kind="image" alt="Bild" />);
    expect(screen.getByText("Hämtar fil…")).toBeInTheDocument();
  });

  it("says when the file is gone", () => {
    url.mockReturnValue(null);
    render(<MediaPreview storageId={storageId} kind="image" alt="Bild" />);
    expect(screen.getByText("Filen finns inte längre.")).toBeInTheDocument();
  });

  it("shows an image, audio player or video player by kind", () => {
    url.mockReturnValue("https://file.example");
    const { rerender } = render(<MediaPreview storageId={storageId} kind="image" alt="Bild" />);
    expect(screen.getByRole("img", { name: "Bild" })).toHaveAttribute("src", "https://file.example");
    rerender(<MediaPreview storageId={storageId} kind="audio" alt="Ljud" />);
    expect(screen.getByLabelText("Ljud").tagName).toBe("AUDIO");
    rerender(<MediaPreview storageId={storageId} kind="video" alt="Video" />);
    expect(screen.getByLabelText("Video").tagName).toBe("VIDEO");
  });
});
