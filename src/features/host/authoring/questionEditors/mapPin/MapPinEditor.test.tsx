import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ContentOf } from "@convex/questions/questionContent";
import { MapPinEditor } from "./MapPinEditor";

const content: ContentOf<"mapPin"> = {
  type: "mapPin",
  target: null,
  radiusMeters: 50_000,
  points: 1,
  initialView: { center: { lat: 62, lng: 15 }, zoom: 4 },
};

describe("MapPinEditor", () => {
  it("sets the target from typed coordinates and links to it", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<MapPinEditor content={content} onChange={onChange} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Latitud"), "67");
    expect(onChange.mock.lastCall?.[0].target.lat).toBe(67);
    await userEvent.type(screen.getByLabelText("Longitud"), "20");
    expect(onChange.mock.lastCall?.[0].target.lng).toBe(20);

    rerender(<MapPinEditor content={{ ...content, target: { lat: 67.85, lng: 20.23 } }} onChange={onChange} />);
    expect(screen.getByRole("link", { name: "Visa målet i OpenStreetMap" })).toHaveAttribute(
      "href",
      "https://www.openstreetmap.org/?mlat=67.85&mlon=20.23#map=9/67.85/20.23",
    );
  });

  it("clears the target when both coordinates are emptied", async () => {
    const onChange = vi.fn();
    render(<MapPinEditor content={{ ...content, target: { lat: 1, lng: Number.NaN } }} onChange={onChange} />);
    await userEvent.clear(screen.getByLabelText("Latitud"));
    expect(onChange.mock.lastCall?.[0].target).toBeNull();
  });

  it("edits the radius in kilometres, the points and the starting view", async () => {
    const onChange = vi.fn();
    render(<MapPinEditor content={content} onChange={onChange} />);
    await userEvent.clear(screen.getByLabelText("Radie (km)"));
    await userEvent.type(screen.getByLabelText("Radie (km)"), "2,5");
    expect(onChange.mock.lastCall?.[0].radiusMeters).toBe(2500);
    await userEvent.type(screen.getByLabelText("Poäng inom radien"), "0");
    expect(onChange.mock.lastCall?.[0].points).toBe(10);
    await userEvent.type(screen.getByLabelText("Startlatitud"), "1");
    expect(onChange.mock.lastCall?.[0].initialView.center.lat).toBe(621);
    await userEvent.type(screen.getByLabelText("Startlongitud"), "1");
    expect(onChange.mock.lastCall?.[0].initialView.center.lng).toBe(151);
    await userEvent.type(screen.getByLabelText("Zoom (0–20)"), "1");
    expect(onChange.mock.lastCall?.[0].initialView.zoom).toBe(41);
  });
});
