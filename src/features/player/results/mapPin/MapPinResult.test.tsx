import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { outcomeOf, part } from "@/features/player/results/resultTestParts.setup";
import { MapPinResult } from "./MapPinResult";

type MapProps = { view: unknown; onViewChange: (view: unknown) => void; markers: { kind: string; colour: string }[]; centerPin?: boolean };
const maps: MapProps[] = [];
vi.mock("@/features/shared/map/BorderMap", () => ({
  BorderMap: (props: MapProps) => {
    maps.push(props);
    return <p>Karta</p>;
  },
}));

const shown = { type: "mapPin" as const, initialView: { center: { lat: 62, lng: 15 }, zoom: 4 } };
const own = { lat: 59.86, lng: 17.64 };
const revealed = {
  type: "mapPin" as const,
  initialView: shown.initialView,
  target: { lat: 59.33, lng: 18.07 },
  radiusMeters: 100_000,
  pins: [
    { teamId: "t1", name: "Röda", colour: "red" as const, pin: own, points: 3, distanceMeters: 64_000 },
    { teamId: "t2", name: "Blå", colour: "blue" as const, pin: { lat: 57.7, lng: 11.97 }, points: 0, distanceMeters: 397_000 },
  ],
};
const latest = () => maps[maps.length - 1];

describe("MapPinResult", () => {
  it("shows the team's pin glowing with its points and distance among the other teams' pins, on a map free to move", () => {
    render(
      <MapPinResult shown={shown} answer={{ type: "mapPin", pin: own }} outcome={outcomeOf(part("right", 3, "64 km från rätt plats"))} imageUrls={{}} revealed={revealed} teamId="t1" />,
    );
    expect(latest()).toMatchObject({ view: { center: own, zoom: 4 }, centerPin: false });
    expect(latest().markers.map((marker) => marker.kind)).toEqual(["pin", "highlight"]);
    expect(screen.getByText("Er nål").parentElement).toHaveClass("result-lit");
    expect(screen.getByText("64 km från rätt plats")).toBeInTheDocument();
    expect(screen.getByText("+3 p")).toBeInTheDocument();
    expect(screen.getByText("Blå")).toBeInTheDocument();
    act(() => latest().onViewChange({ center: { lat: 57, lng: 12 }, zoom: 5 }));
    expect(latest().view).toEqual({ center: { lat: 57, lng: 12 }, zoom: 5 });
  });

  it("shows a pin that scored nothing in the team's colour, with no other teams to look at", () => {
    render(<MapPinResult shown={shown} answer={{ type: "mapPin", pin: own }} outcome={outcomeOf(part("wrong", 0, "64 km från rätt plats"))} imageUrls={{}} revealed={null} teamId="t1" />);
    expect(latest().markers).toEqual([expect.objectContaining({ kind: "own" })]);
    expect(screen.queryByText("Dra i kartan för att se de andra lagens nålar")).not.toBeInTheDocument();
    expect(screen.getByText("Er nål").parentElement).not.toHaveClass("result-lit");
  });
});
