import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { TvVideo } from "./TvVideo";

const getFilmUrl = vi.fn();
vi.mock("convex/react", () => ({ useMutation: () => getFilmUrl }));

const questionId = "q1" as Id<"questions">;

describe("TvVideo", () => {
  beforeEach(() => {
    getFilmUrl.mockReset().mockResolvedValue("https://films.example.com/tomte.mp4");
    // jsdom has no media playback, so play and pause are stand-ins.
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it("asks for the question's film and shows its still until it plays", async () => {
    const { container } = await act(async () =>
      render(<TvVideo questionId={questionId} posterUrl="https://example.com/still.jpg" playback={{ kind: "paused", positionMs: 0 }} />),
    );
    const video = container.querySelector("video");
    expect(getFilmUrl).toHaveBeenCalledWith({ questionId });
    expect(video).toHaveAttribute("src", "https://films.example.com/tomte.mp4");
    expect(video).toHaveAttribute("poster", "https://example.com/still.jpg");
  });

  it("ignores a film link that arrives after the question has changed", async () => {
    let answer: (url: string) => void = () => {};
    getFilmUrl.mockReturnValueOnce(new Promise((resolve) => (answer = resolve)));
    const { container, rerender } = render(<TvVideo questionId={questionId} posterUrl={null} playback={null} />);
    await act(async () => rerender(<TvVideo questionId={"q2" as Id<"questions">} posterUrl={null} playback={null} />));
    await act(async () => answer("https://films.example.com/old.mp4"));
    expect(container.querySelector("video")).toHaveAttribute("src", "https://films.example.com/tomte.mp4");
  });
});
