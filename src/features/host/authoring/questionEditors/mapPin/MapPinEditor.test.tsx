import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ContentOf } from "@convex/questions/questionContent";
import type { MapView } from "@/features/shared/map/mapView";
import { MapPinEditor } from "./MapPinEditor";

type FakeMapProps = { label: string; view: MapView; radiusMeters?: number | null; onViewChange: (view: MapView) => void };

const kiruna = { center: { lat: 67.85, lng: 20.23 }, zoom: 7 };

// Leaflet can't draw in the test browser, so each map shows its props and offers one move.
vi.mock("@/features/shared/map/BorderMap", () => ({
  BorderMap: ({ label, view, radiusMeters, onViewChange }: FakeMapProps) => (
    <div role="group" aria-label={label}>
      <span>{`${view.center.lat}/${view.center.lng}/${view.zoom}/${radiusMeters ?? "ingen radie"}`}</span>
      <button type="button" onClick={() => onViewChange(kiruna)}>
        Flytta till Kiruna
      </button>
      <button type="button" onClick={() => onViewChange({ ...view, zoom: view.zoom + 1 })}>
        Zooma in
      </button>
    </div>
  ),
}));

const content: ContentOf<"mapPin"> = {
  type: "mapPin",
  target: null,
  radiusMeters: 50_000,
  points: 1,
  initialView: { center: { lat: 62, lng: 15 }, zoom: 4 },
};

const answerMap = () => screen.getByRole("group", { name: "Karta för rätt svar" });
const startMap = () => screen.getByRole("group", { name: "Karta för mobilens startvy" });

describe("MapPinEditor", () => {
  it("starts the answer map at the phone's starting view until the answer is placed", () => {
    render(<MapPinEditor content={content} onChange={vi.fn()} />);
    expect(answerMap()).toHaveTextContent("62/15/4/ingen radie");
    expect(startMap()).toHaveTextContent("62/15/4/ingen radie");
  });

  it("sets the answer where the pin points after the map is moved, and keeps that zoom", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<MapPinEditor content={content} onChange={onChange} />);
    await userEvent.click(screen.getAllByRole("button", { name: "Flytta till Kiruna" })[0]);
    expect(onChange).toHaveBeenLastCalledWith({ ...content, target: kiruna.center });

    rerender(<MapPinEditor content={{ ...content, target: kiruna.center }} onChange={onChange} />);
    expect(answerMap()).toHaveTextContent("67.85/20.23/7/50000");
    expect(screen.getByLabelText("Latitud")).toHaveValue("67,85");
  });

  it("places no answer when the map is only zoomed", async () => {
    const onChange = vi.fn();
    render(<MapPinEditor content={content} onChange={onChange} />);
    await userEvent.click(screen.getAllByRole("button", { name: "Zooma in" })[0]);
    expect(onChange).not.toHaveBeenCalled();
    expect(answerMap()).toHaveTextContent("62/15/5/ingen radie");
  });

  it("keeps the answer map at the starting view while a coordinate is half-typed", () => {
    render(<MapPinEditor content={{ ...content, target: { lat: 67, lng: Number.NaN } }} onChange={vi.fn()} />);
    expect(answerMap()).toHaveTextContent("62/15/4/ingen radie");
  });

  it("sets the phone's starting view from its own map", async () => {
    const onChange = vi.fn();
    render(<MapPinEditor content={content} onChange={onChange} />);
    await userEvent.click(screen.getAllByRole("button", { name: "Flytta till Kiruna" })[1]);
    expect(onChange).toHaveBeenLastCalledWith({ ...content, initialView: kiruna });
  });

  it("sets the answer from typed coordinates", async () => {
    const onChange = vi.fn();
    render(<MapPinEditor content={content} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Latitud"), "67");
    expect(onChange.mock.lastCall?.[0].target.lat).toBe(67);
    await userEvent.type(screen.getByLabelText("Longitud"), "20");
    expect(onChange.mock.lastCall?.[0].target.lng).toBe(20);
  });

  it("clears the answer when both coordinates are emptied", async () => {
    const onChange = vi.fn();
    render(<MapPinEditor content={{ ...content, target: { lat: 1, lng: Number.NaN } }} onChange={onChange} />);
    await userEvent.clear(screen.getByLabelText("Latitud"));
    expect(onChange.mock.lastCall?.[0].target).toBeNull();
  });

  it("edits the radius in kilometres and the points", async () => {
    const onChange = vi.fn();
    render(<MapPinEditor content={content} onChange={onChange} />);
    await userEvent.clear(screen.getByLabelText("Radie (km)"));
    await userEvent.type(screen.getByLabelText("Radie (km)"), "2,5");
    expect(onChange.mock.lastCall?.[0].radiusMeters).toBe(2500);
    await userEvent.type(screen.getByLabelText("Poäng inom radien"), "0");
    expect(onChange.mock.lastCall?.[0].points).toBe(10);
  });
});
