import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readVideoFacts } from "./readVideoFacts";

// jsdom can't decode video or draw on a canvas, so both are stand-ins that behave like a
// browser that can: setting src loads the metadata, setting currentTime seeks.
type FakeVideo = EventTarget & { duration: number; videoWidth: number; videoHeight: number; currentTime: number };

function fakeVideo({ duration, fails }: { duration: number; fails?: "load" | "seek" }): FakeVideo {
  const video = new EventTarget() as FakeVideo & { src: string; muted: boolean; preload: string; removeAttribute: () => void };
  Object.assign(video, { duration, videoWidth: 1920, videoHeight: 1080, muted: false, preload: "", removeAttribute: vi.fn() });
  let time = 0;
  Object.defineProperty(video, "src", {
    set: () => queueMicrotask(() => video.dispatchEvent(new Event(fails === "load" ? "error" : "loadedmetadata"))),
  });
  Object.defineProperty(video, "currentTime", {
    get: () => time,
    set: (value: number) => {
      time = value;
      queueMicrotask(() => video.dispatchEvent(new Event(fails === "seek" ? "error" : "seeked")));
    },
  });
  return video;
}

const jpeg = new Blob(["jpeg"], { type: "image/jpeg" });
const drawImage = vi.fn();
let video: FakeVideo;

beforeEach(() => {
  const createElement = document.createElement.bind(document);
  vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
    if (tag === "video") return video as unknown as HTMLElement;
    const element = createElement(tag);
    if (tag === "canvas") {
      Object.assign(element, {
        getContext: () => ({ drawImage }),
        toBlob: (done: (blob: Blob) => void) => done(jpeg),
      });
    }
    return element;
  });
  URL.createObjectURL = vi.fn(() => "blob:film");
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("readVideoFacts", () => {
  it("reads the length and a 640-wide still from a few seconds in", async () => {
    video = fakeVideo({ duration: 120 });
    await expect(readVideoFacts(new Blob(["film"]))).resolves.toEqual({ durationSeconds: 120, still: jpeg });
    expect(video.currentTime).toBe(3);
    expect(drawImage).toHaveBeenCalledWith(video, 0, 0, 640, 360);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:film");
  });

  it("takes the still from the middle of a very short film", async () => {
    video = fakeVideo({ duration: 2 });
    await readVideoFacts(new Blob(["film"]));
    expect(video.currentTime).toBe(1);
  });

  it("keeps the length when no still can be taken", async () => {
    video = fakeVideo({ duration: 120, fails: "seek" });
    await expect(readVideoFacts(new Blob(["film"]))).resolves.toEqual({ durationSeconds: 120, still: null });
  });

  it("gives up on a file the browser can't read", async () => {
    video = fakeVideo({ duration: 120, fails: "load" });
    await expect(readVideoFacts(new Blob(["film"]))).resolves.toEqual({ durationSeconds: null, still: null });
  });

  it("gives no length or still for a film of unknown length", async () => {
    video = fakeVideo({ duration: Number.POSITIVE_INFINITY });
    await expect(readVideoFacts(new Blob(["film"]))).resolves.toEqual({ durationSeconds: null, still: null });
  });
});
