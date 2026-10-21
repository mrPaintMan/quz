import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FilmField } from "./FilmField";

const video = { kind: "video" as const, r2Key: "film-key", posterId: null, durationSeconds: 60 };
const uploadVideo = vi.fn();
vi.mock("./useUploadVideo", () => ({ useUploadVideo: () => uploadVideo }));
vi.mock("@/features/host/shared/useHostQuery", () => ({ useHostQuery: () => undefined }));
vi.mock("@/features/host/shared/useHostMutation", () => ({ useHostMutation: () => vi.fn() }));

function chooseFile(container: HTMLElement, file: File) {
  fireEvent.change(container.querySelector('input[type="file"]') as HTMLInputElement, { target: { files: [file] } });
}

describe("FilmField", () => {
  beforeEach(() => uploadVideo.mockReset().mockResolvedValue(video));

  it("uploads a film and hands it over, with export advice", async () => {
    const onChange = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<FilmField title="Filmen" video={null} onChange={onChange} />);
    expect(screen.getByText(/1080p, 30 bilder per sekund/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ladda upp film" })).toBeInTheDocument();
    chooseFile(container, new File(["x"], "tag.mp4", { type: "video/mp4" }));
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith(video));
  });

  it("refuses anything but video", async () => {
    const { container } = render(<FilmField title="Filmen" video={null} onChange={vi.fn()} />);
    chooseFile(container, new File(["x"], "karta.png", { type: "image/png" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(uploadVideo).not.toHaveBeenCalled();
  });

  it("shows an uploaded film and can remove it", async () => {
    const onChange = vi.fn().mockResolvedValue(undefined);
    render(<FilmField title="Filmen" video={video} onChange={onChange} />);
    expect(screen.getByText("Längd 1:00")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Ta bort film" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
