import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { shrinkImage } from "./shrinkImage";

const photo = new Blob(["x".repeat(1000)], { type: "image/jpeg" });
const drawn: number[][] = [];

// jsdom draws nothing, so the browser's picture tools are stand-ins: a 4000 × 3000 photo, and a
// canvas that gives files of the type asked for (PNG for WebP when it "can't" write WebP).
function fakeBrowser({ writesWebp = true, size = 100 } = {}) {
  vi.stubGlobal("createImageBitmap", vi.fn(async () => ({ width: 4000, height: 3000, close: vi.fn() })));
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    drawImage: (_bitmap: unknown, _x: number, _y: number, width: number, height: number) => drawn.push([width, height]),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((done, type) =>
    done(new Blob(["x".repeat(size)], { type: type === "image/webp" && !writesWebp ? "image/png" : type })),
  );
}

describe("shrinkImage", () => {
  beforeEach(() => {
    drawn.length = 0;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("redraws a large photo at most 1920 pixels wide, as WebP", async () => {
    fakeBrowser();
    const shrunk = await shrinkImage(photo);
    expect(drawn).toEqual([[1920, 1440]]);
    expect(shrunk.type).toBe("image/webp");
    expect(shrunk.size).toBe(100);
  });

  it("falls back to JPEG where the browser can't write WebP, but keeps a PNG that may be transparent", async () => {
    fakeBrowser({ writesWebp: false });
    expect((await shrinkImage(photo)).type).toBe("image/jpeg");
    const png = new Blob(["x".repeat(1000)], { type: "image/png" });
    expect(await shrinkImage(png)).toBe(png);
  });

  it("keeps the original when redrawing wouldn't make it smaller", async () => {
    fakeBrowser({ size: 5000 });
    expect(await shrinkImage(photo)).toBe(photo);
  });

  it("keeps sound, animated GIFs and SVGs as they are", async () => {
    fakeBrowser();
    for (const type of ["audio/mpeg", "image/gif", "image/svg+xml"]) {
      const file = new Blob(["x"], { type });
      expect(await shrinkImage(file)).toBe(file);
    }
    expect(drawn).toEqual([]);
  });

  it("keeps an image the browser can't open or draw", async () => {
    vi.stubGlobal("createImageBitmap", vi.fn(async () => Promise.reject(new Error("trasig"))));
    expect(await shrinkImage(photo)).toBe(photo);
    vi.stubGlobal("createImageBitmap", vi.fn(async () => ({ width: 10, height: 10, close: vi.fn() })));
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(await shrinkImage(photo)).toBe(photo);
  });

  it("keeps the image in a browser without the tools to redraw it", async () => {
    expect(await shrinkImage(photo)).toBe(photo);
  });
});
