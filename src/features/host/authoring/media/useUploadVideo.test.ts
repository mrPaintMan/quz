import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useUploadVideo } from "./useUploadVideo";

const still = new Blob(["jpeg"], { type: "image/jpeg" });
const uploadFile = vi.fn();
const readVideoFacts = vi.fn();
vi.mock("./useUploadFile", () => ({ useUploadFile: () => uploadFile }));
vi.mock("./useUploadFilm", () => ({ useUploadFilm: () => async () => "film-key" }));
vi.mock("./readVideoFacts", () => ({ readVideoFacts: (file: Blob) => readVideoFacts(file) }));

describe("useUploadVideo", () => {
  it("uploads the film and its still and gives the video with its length", async () => {
    readVideoFacts.mockResolvedValue({ still, durationSeconds: 90 });
    uploadFile.mockResolvedValue("still-id");
    const { result } = renderHook(() => useUploadVideo());
    await expect(result.current(new File(["x"], "tag.mp4", { type: "video/mp4" }))).resolves.toEqual({
      kind: "video",
      r2Key: "film-key",
      posterId: "still-id",
      durationSeconds: 90,
    });
  });

  it("keeps the film when only its still fails to upload", async () => {
    readVideoFacts.mockResolvedValue({ still, durationSeconds: 90 });
    uploadFile.mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useUploadVideo());
    await expect(result.current(new File(["x"], "tag.mp4"))).resolves.toMatchObject({ r2Key: "film-key", posterId: null });
  });

  it("uploads no still when none could be read", async () => {
    readVideoFacts.mockResolvedValue({ still: null, durationSeconds: null });
    uploadFile.mockClear();
    const { result } = renderHook(() => useUploadVideo());
    await expect(result.current(new File(["x"], "tag.mov"))).resolves.toMatchObject({ posterId: null, durationSeconds: null });
    expect(uploadFile).not.toHaveBeenCalled();
  });
});
