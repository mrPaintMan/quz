import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MapPinAnswer, MapPinQuestion } from "./MapPinDisplay";

const maps: Record<string, unknown>[] = [];
vi.mock("@/features/shared/map/BorderMap", () => ({
  BorderMap: (props: Record<string, unknown>) => {
    maps.push(props);
    return <p>Karta</p>;
  },
}));

const target = { lat: 59.33, lng: 18.07 };
const revealed = {
  type: "mapPin" as const,
  initialView: { center: { lat: 62, lng: 15 }, zoom: 4 },
  target,
  radiusMeters: 100_000,
  pins: [
    { teamId: "t2", name: "Blå", colour: "blue" as const, pin: { lat: 59.86, lng: 17.64 }, points: 3, distanceMeters: 64_000 },
    { teamId: "t1", name: "Röda", colour: "red" as const, pin: { lat: 57.7, lng: 11.97 }, points: 0, distanceMeters: 397_000 },
  ],
};

describe("MapPinQuestion", () => {
  it("adds nothing to the question", () => {
    const { container } = render(<MapPinQuestion />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("MapPinAnswer", () => {
  it("shows the right place with its radius and every team's pin, and lists the teams with how far off they were", () => {
    render(<MapPinAnswer revealed={revealed} imageUrls={{}} />);
    expect(maps.at(-1)).toMatchObject({ circleAt: target, radiusMeters: 100_000, centerPin: false, view: revealed.initialView });
    const markers = maps.at(-1)?.markers as { kind: string }[];
    expect(markers.map((marker) => marker.kind)).toEqual(["pin", "pin", "target"]);
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Blå64 km+3 p", "Röda397 km"]);
  });

  it("lists nothing when no team placed a pin", () => {
    render(<MapPinAnswer revealed={{ ...revealed, pins: [] }} imageUrls={{}} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
