import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePreloadPictures } from "./usePreloadPictures";

const urls = vi.fn();
vi.mock("convex/react", () => ({ useQuery: () => urls() }));

describe("usePreloadPictures", () => {
  it("loads each of the next screen's pictures once", () => {
    const created: string[] = [];
    // A stand-in picture that notes what it is asked to load.
    vi.stubGlobal(
      "Image",
      vi.fn(function Picture() {
        return {
          set src(url: string) {
            created.push(url);
          },
        };
      }),
    );
    urls.mockReturnValue(["https://bild/1", "https://bild/2"]);
    const { rerender } = renderHook(() => usePreloadPictures());
    urls.mockReturnValue(["https://bild/2", "https://bild/3"]);
    rerender();
    expect(created).toEqual(["https://bild/1", "https://bild/2", "https://bild/3"]);
    vi.unstubAllGlobals();
  });

  it("loads nothing while the links load", () => {
    urls.mockReturnValue(undefined);
    expect(() => renderHook(() => usePreloadPictures())).not.toThrow();
  });
});
