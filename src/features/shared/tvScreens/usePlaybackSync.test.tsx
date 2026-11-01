import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Playback } from "@convex/games/playback";
import { usePlaybackSync } from "./usePlaybackSync";

function Clip({ playback }: { playback: Playback | null }) {
  const { ref, blocked, sync } = usePlaybackSync<HTMLAudioElement>(playback);
  return (
    <>
      <audio ref={ref} data-testid="clip" />
      {blocked && <button onClick={sync}>Spela ljud</button>}
    </>
  );
}

const play = vi.fn();
const pause = vi.fn();
const clip = () => screen.getByTestId("clip") as HTMLAudioElement;

describe("usePlaybackSync", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(10_000);
    // jsdom has no media playback, so play and pause are stand-ins.
    play.mockReset().mockResolvedValue(undefined);
    pause.mockReset();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(play);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(pause);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("plays from the spot the playback has reached", async () => {
    await act(async () => render(<Clip playback={{ kind: "playing", startedAt: 6_000 }} />));
    expect(clip().currentTime).toBe(4);
    expect(play).toHaveBeenCalled();
  });

  it("pauses at the paused spot", async () => {
    await act(async () => render(<Clip playback={{ kind: "paused", positionMs: 2_500 }} />));
    expect(clip().currentTime).toBe(2.5);
    expect(pause).toHaveBeenCalled();
    expect(play).not.toHaveBeenCalled();
  });

  it("follows a change from the hosts", async () => {
    const { rerender } = await act(async () => render(<Clip playback={{ kind: "paused", positionMs: 0 }} />));
    await act(async () => rerender(<Clip playback={{ kind: "playing", startedAt: 10_000 }} />));
    expect(play).toHaveBeenCalled();
  });

  it("does nothing without a playback", async () => {
    await act(async () => render(<Clip playback={null} />));
    expect(play).not.toHaveBeenCalled();
    expect(pause).not.toHaveBeenCalled();
  });

  it("asks for a click when the browser refuses sound, and plays on that click", async () => {
    vi.useRealTimers();
    play.mockRejectedValueOnce(new DOMException("No sound before a click", "NotAllowedError"));
    await act(async () => render(<Clip playback={{ kind: "playing", startedAt: Date.now() }} />));
    await userEvent.click(screen.getByRole("button", { name: "Spela ljud" }));
    expect(play).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("button", { name: "Spela ljud" })).not.toBeInTheDocument();
  });

  it("doesn't ask for a click when the clip is only still loading", async () => {
    play.mockRejectedValueOnce(new DOMException("Not loaded yet", "AbortError"));
    await act(async () => render(<Clip playback={{ kind: "playing", startedAt: 6_000 }} />));
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("plays on from where it paused, whatever this device's clock says", async () => {
    const { rerender } = await act(async () => render(<Clip playback={{ kind: "paused", positionMs: 2_000 }} />));
    // The server's start, worked out on its clock, is 3 seconds before this device's idea of it.
    await act(async () => rerender(<Clip playback={{ kind: "playing", startedAt: 5_000 }} />));
    expect(clip().currentTime).toBe(2);
  });

  it("doesn't seek again for an equal playback from a later game update", async () => {
    const { rerender } = await act(async () => render(<Clip playback={{ kind: "playing", startedAt: 6_000 }} />));
    await act(async () => rerender(<Clip playback={{ kind: "playing", startedAt: 6_000 }} />));
    expect(play).toHaveBeenCalledTimes(1);
  });

  it("stops asking for a click once the hosts pause", async () => {
    vi.useRealTimers();
    play.mockRejectedValueOnce(new DOMException("No sound before a click", "NotAllowedError"));
    const { rerender } = await act(async () => render(<Clip playback={{ kind: "playing", startedAt: Date.now() }} />));
    expect(screen.getByRole("button", { name: "Spela ljud" })).toBeInTheDocument();
    await act(async () => rerender(<Clip playback={{ kind: "paused", positionMs: 1_000 }} />));
    expect(screen.queryByRole("button", { name: "Spela ljud" })).not.toBeInTheDocument();
  });
});
