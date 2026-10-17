import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useUploadFile } from "./useUploadFile";

vi.mock("@/features/host/shared/useHostMutation", () => ({
  useHostMutation: () => vi.fn().mockResolvedValue("https://upload.example"),
}));

describe("useUploadFile", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("posts the file to a fresh upload URL and returns the storage id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ storageId: "file1" }) });
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useUploadFile());
    const file = new File(["bild"], "tomte.png", { type: "image/png" });

    await expect(result.current(file)).resolves.toBe("file1");
    expect(fetchMock).toHaveBeenCalledWith("https://upload.example", {
      method: "POST",
      headers: { "Content-Type": "image/png" },
      body: file,
    });
  });

  it("fails when the upload is refused", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const { result } = renderHook(() => useUploadFile());
    await expect(result.current(new File([""], "x.png"))).rejects.toThrow("Uppladdningen misslyckades.");
  });
});
