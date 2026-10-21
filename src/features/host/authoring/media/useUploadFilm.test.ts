import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useUploadFilm } from "./useUploadFilm";

vi.mock("@/features/host/shared/useHostMutation", () => ({
  useHostMutation: () => vi.fn().mockResolvedValue({ key: "film-key", url: "https://r2.example/film-key" }),
}));

describe("useUploadFilm", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("puts the film at a fresh signed R2 link and returns its key", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useUploadFilm());
    const film = new File(["film"], "tag.mp4", { type: "video/mp4" });

    await expect(result.current(film)).resolves.toBe("film-key");
    expect(fetchMock).toHaveBeenCalledWith("https://r2.example/film-key", {
      method: "PUT",
      headers: { "Content-Type": "video/mp4" },
      body: film,
    });
  });

  it("fails when R2 refuses the upload", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const { result } = renderHook(() => useUploadFilm());
    await expect(result.current(new File([""], "tag.mp4"))).rejects.toThrow("Uppladdningen misslyckades.");
  });
});
