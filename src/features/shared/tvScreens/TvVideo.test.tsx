import { act, fireEvent, render, screen as page } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { screenKey } from "@/domain/screenSequence/isSameScreen";
import { PreloadedFilms } from "./preloadedFilms";
import { TvVideo } from "./TvVideo";

const getFilmUrl = vi.fn();
vi.mock("convex/react", () => ({ useMutation: () => getFilmUrl }));

const screen = { kind: "question" as const, questionId: "q1" as Id<"questions"> };
const paused = { kind: "paused" as const, positionMs: 0 };

// The video element's own position and length, as the browser would report them.
function playAt(video: HTMLVideoElement, currentTime: number, duration = 100) {
  Object.defineProperty(video, "duration", { value: duration, configurable: true });
  video.currentTime = currentTime;
}

describe("TvVideo", () => {
  beforeEach(() => {
    getFilmUrl.mockReset().mockResolvedValue("https://films.example.com/tomte.mp4");
    // jsdom has no media playback, so play and pause are stand-ins.
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it("asks for its screen's film and shows its still until it plays", async () => {
    const { container } = await act(async () =>
      render(<TvVideo screen={screen} posterUrl="https://example.com/still.jpg" playback={paused} showsCluePoints={false} />),
    );
    const video = container.querySelector("video");
    expect(getFilmUrl).toHaveBeenCalledWith({ screen });
    expect(video).toHaveAttribute("src", "https://films.example.com/tomte.mp4");
    expect(video).toHaveAttribute("poster", "https://example.com/still.jpg");
  });

  it("plays the copy the TV downloaded ahead, without asking for the film", async () => {
    const copies = new Map([[screenKey(screen), "blob:tomte"]]);
    const { container } = await act(async () =>
      render(
        <PreloadedFilms value={copies}>
          <TvVideo screen={screen} posterUrl={null} playback={paused} showsCluePoints={false} />
        </PreloadedFilms>,
      ),
    );
    expect(getFilmUrl).not.toHaveBeenCalled();
    expect(container.querySelector("video")).toHaveAttribute("src", "blob:tomte");
  });

  it("keeps streaming when the copy finishes after the screen showed", async () => {
    const tree = (copies: Map<string, string>) => (
      <PreloadedFilms value={copies}>
        <TvVideo screen={screen} posterUrl={null} playback={paused} showsCluePoints={false} />
      </PreloadedFilms>
    );
    const { container, rerender } = await act(async () => render(tree(new Map())));
    await act(async () => rerender(tree(new Map([[screenKey(screen), "blob:tomte"]]))));
    expect(container.querySelector("video")).toHaveAttribute("src", "https://films.example.com/tomte.mp4");
  });

  it("asks only once while game updates hand out equal screens", async () => {
    const { rerender } = await act(async () => render(<TvVideo screen={screen} posterUrl={null} playback={null} showsCluePoints={false} />));
    await act(async () => rerender(<TvVideo screen={{ ...screen }} posterUrl={null} playback={null} showsCluePoints={false} />));
    expect(getFilmUrl).toHaveBeenCalledTimes(1);
  });

  it("ignores a film link that arrives after the screen has changed", async () => {
    let answer: (url: string) => void = () => {};
    getFilmUrl.mockReturnValueOnce(new Promise((resolve) => (answer = resolve)));
    const { container, rerender } = render(<TvVideo screen={screen} posterUrl={null} playback={null} showsCluePoints={false} />);
    const next = { ...screen, questionId: "q2" as Id<"questions"> };
    await act(async () => rerender(<TvVideo screen={next} posterUrl={null} playback={null} showsCluePoints={false} />));
    await act(async () => answer("https://films.example.com/old.mp4"));
    expect(container.querySelector("video")).toHaveAttribute("src", "https://films.example.com/tomte.mp4");
  });

  it("shows the trip's points once its film plays, and hides them when it ends", async () => {
    const { container } = await act(async () => render(<TvVideo screen={screen} posterUrl={null} playback={paused} showsCluePoints />));
    const video = container.querySelector("video")!;
    expect(page.queryByText("10")).not.toBeInTheDocument();
    playAt(video, 30);
    fireEvent.playing(video);
    expect(page.getByText("8")).toHaveClass("opacity-100");
    fireEvent.ended(video);
    expect(page.getByText("8")).toHaveClass("opacity-0");
  });

  it("shows no points over other films", async () => {
    const { container } = await act(async () => render(<TvVideo screen={screen} posterUrl={null} playback={paused} showsCluePoints={false} />));
    const video = container.querySelector("video")!;
    playAt(video, 30);
    fireEvent.playing(video);
    expect(page.queryByText("8")).not.toBeInTheDocument();
  });

  it("takes the film's own shape once it loads", async () => {
    const { container } = await act(async () => render(<TvVideo screen={screen} posterUrl={null} playback={paused} showsCluePoints={false} />));
    const video = container.querySelector("video")!;
    Object.defineProperty(video, "videoWidth", { value: 1440 });
    Object.defineProperty(video, "videoHeight", { value: 1080 });
    fireEvent.loadedMetadata(video);
    expect(video.parentElement!.style.aspectRatio).toBe(`${4 / 3} / 1`);
  });
});
