import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MapPinInput } from "./MapPinInput";

type MapProps = { view: unknown; onViewChange: (view: unknown) => void; centerPin?: boolean; markers?: unknown[] };
const maps: MapProps[] = [];
vi.mock("@/features/shared/map/BorderMap", () => ({
  BorderMap: (props: MapProps) => {
    maps.push(props);
    return <p>Karta</p>;
  },
}));

const shown = { type: "mapPin" as const, initialView: { center: { lat: 62, lng: 15 }, zoom: 4 } };
const latest = () => maps[maps.length - 1];

describe("MapPinInput", () => {
  it("starts at the question's view with the pin in the middle, and answers where the map is moved", () => {
    const onChange = vi.fn();
    render(<MapPinInput shown={shown} answer={null} imageUrls={{}} disabled={false} onChange={onChange} />);
    expect(screen.getByText("Flytta kartan så att nålen pekar på svaret")).toBeInTheDocument();
    expect(latest()).toMatchObject({ view: shown.initialView, centerPin: true, markers: [] });
    act(() => latest().onViewChange({ center: { lat: 59.3, lng: 18.1 }, zoom: 6 }));
    expect(onChange).toHaveBeenCalledWith({ type: "mapPin", pin: { lat: 59.3, lng: 18.1 } });
    expect(latest().view).toEqual({ center: { lat: 59.3, lng: 18.1 }, zoom: 6 });
  });

  it("shows a locked answer as a pin, the map still free to look around", () => {
    const onChange = vi.fn();
    render(<MapPinInput shown={shown} answer={{ type: "mapPin", pin: { lat: 59, lng: 18 } }} imageUrls={{}} disabled onChange={onChange} />);
    expect(screen.getByText("Ert svar")).toBeInTheDocument();
    expect(latest()).toMatchObject({ view: { center: { lat: 59, lng: 18 }, zoom: 4 }, centerPin: false, markers: [{ at: { lat: 59, lng: 18 }, kind: "own" }] });
    act(() => latest().onViewChange({ center: { lat: 50, lng: 10 }, zoom: 4 }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
