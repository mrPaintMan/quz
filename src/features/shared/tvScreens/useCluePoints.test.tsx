import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCluePoints } from "./useCluePoints";

function Film() {
  const { points, handlers } = useCluePoints();
  return (
    <>
      <video data-testid="film" {...handlers} />
      <p>{points ?? "inga"}</p>
    </>
  );
}

function at(currentTime: number) {
  const video = screen.getByTestId("film") as HTMLVideoElement;
  Object.defineProperty(video, "duration", { value: 100, configurable: true });
  video.currentTime = currentTime;
  return video;
}

describe("useCluePoints", () => {
  it("has no points before the film first plays", () => {
    render(<Film />);
    fireEvent.timeUpdate(at(0));
    expect(screen.getByText("inga")).toBeInTheDocument();
  });

  it("shows the points of a paused film a reloaded TV seeks into", () => {
    render(<Film />);
    fireEvent.timeUpdate(at(30));
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("follows the film's position once it plays", () => {
    render(<Film />);
    fireEvent.playing(at(0));
    expect(screen.getByText("10")).toBeInTheDocument();
    fireEvent.timeUpdate(at(65));
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("has no points after the film ends", () => {
    render(<Film />);
    fireEvent.playing(at(90));
    fireEvent.ended(at(100));
    expect(screen.getByText("inga")).toBeInTheDocument();
  });
});
