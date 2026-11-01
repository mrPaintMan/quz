import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TvAudio } from "./TvAudio";

describe("TvAudio", () => {
  beforeEach(() => {
    // jsdom has no media playback, so play and pause are stand-ins.
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it("shows that a clip waits to be played", async () => {
    await act(async () => render(<TvAudio url="https://example.com/jingle.mp3" playback={{ kind: "paused", positionMs: 0 }} />));
    expect(screen.getByText("Ljudklipp")).toBeInTheDocument();
  });

  it("tells the room to listen while it plays", async () => {
    await act(async () => render(<TvAudio url="https://example.com/jingle.mp3" playback={{ kind: "playing", startedAt: Date.now() }} />));
    expect(screen.getByText("Lyssna!")).toBeInTheDocument();
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it("offers the click for sound when the browser refuses it", async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValue(new DOMException("No sound", "NotAllowedError"));
    await act(async () => render(<TvAudio url="https://example.com/jingle.mp3" playback={{ kind: "playing", startedAt: Date.now() }} />));
    expect(screen.getByRole("button", { name: "Klicka för att slå på ljudet" })).toBeInTheDocument();
  });
});
