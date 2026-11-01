import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import type { ShownMedia } from "@convex/media/linkScreenMedia";
import { TvMedia } from "./TvMedia";

vi.mock("convex/react", () => ({ useMutation: () => vi.fn().mockResolvedValue("https://films.example.com/tomte.mp4") }));

const questionId = "q1" as Id<"questions">;
const audio: ShownMedia = { kind: "audio", url: "https://example.com/jingle.mp3" };
const video: ShownMedia = { kind: "video", questionId, posterUrl: "https://example.com/still.jpg" };
const paused = { kind: "paused" as const, positionMs: 0 };

describe("TvMedia", () => {
  beforeEach(() => {
    // jsdom has no media playback, so play and pause are stand-ins.
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it("shows a picture", () => {
    render(<TvMedia media={{ kind: "image", url: "https://example.com/tomte.jpg" }} playback={null} silent={false} />);
    expect(screen.getByRole("presentation")).toHaveAttribute("src", "https://example.com/tomte.jpg");
  });

  it("plays a sound clip on the TV", async () => {
    const { container } = await act(async () => render(<TvMedia media={audio} playback={paused} silent={false} />));
    expect(container.querySelector("audio")).toBeInTheDocument();
  });

  it("plays a video on the TV", async () => {
    const { container } = await act(async () => render(<TvMedia media={video} playback={paused} silent={false} />));
    expect(container.querySelector("video")).toBeInTheDocument();
  });

  it("only names a sound clip when silent", () => {
    const { container } = render(<TvMedia media={audio} playback={paused} silent />);
    expect(screen.getByText("Ljudklipp")).toBeInTheDocument();
    expect(container.querySelector("audio")).not.toBeInTheDocument();
  });

  it("shows a video's still when silent", () => {
    const { container } = render(<TvMedia media={video} playback={paused} silent />);
    expect(screen.getByRole("presentation")).toHaveAttribute("src", "https://example.com/still.jpg");
    expect(container.querySelector("video")).not.toBeInTheDocument();
  });

  it("names a video without a still when silent", () => {
    render(<TvMedia media={{ ...video, posterUrl: null }} playback={paused} silent />);
    expect(screen.getByText("Videoklipp")).toBeInTheDocument();
  });
});
