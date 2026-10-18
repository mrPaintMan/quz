import type * as Leaflet from "leaflet";
import { describe, expect, it, vi } from "vitest";
import { createBorderMap } from "./createBorderMap";

const shapes = {
  land: { type: "FeatureCollection" as const, features: [] },
  borders: { type: "MultiLineString" as const, coordinates: [] },
};
const stockholm = { center: { lat: 59.33, lng: 18.07 }, zoom: 5 };

// Just enough of Leaflet to drive the map: moving it fires "move" and "moveend",
// synchronously as Leaflet does without animation.
function fakeLeaflet() {
  const handlers: Record<string, () => void> = {};
  let center = { lat: 0, lng: 0 };
  let zoom = 0;
  const moveTo = (lat: number, lng: number, nextZoom: number) => {
    center = { lat, lng };
    zoom = nextZoom;
    handlers.move?.();
    handlers.moveend?.();
  };
  const map = {
    on: (event: string, handler: () => void) => (handlers[event] = handler),
    getCenter: () => ({ ...center, wrap: () => ({ lat: center.lat, lng: ((((center.lng + 180) % 360) + 360) % 360) - 180 }) }),
    getZoom: () => zoom,
    setView: vi.fn(([lat, lng]: [number, number], nextZoom: number) => moveTo(lat, lng, nextZoom)),
    resize: () => handlers.resize?.(),
    remove: vi.fn(),
  };
  const circle = { addTo: () => circle, setLatLng: vi.fn(), remove: vi.fn() };
  const zoomControl = { addTo: vi.fn() };
  const L = {
    map: vi.fn((_element: HTMLElement, options: { center: [number, number]; zoom: number }) => {
      [center.lat, center.lng] = options.center;
      zoom = options.zoom;
      return map;
    }),
    canvas: vi.fn(),
    control: { zoom: vi.fn(() => zoomControl) },
    geoJSON: vi.fn(() => ({ addTo: vi.fn() })),
    circle: vi.fn(() => circle),
  };
  return { L: L as unknown as typeof Leaflet, fake: L, map, circle, userMovesTo: moveTo };
}

function setUp(radiusMeters: number | null = null) {
  const leaflet = fakeLeaflet();
  const onUserMove = vi.fn();
  const element = document.createElement("div");
  const controller = createBorderMap(leaflet.L, element, shapes, { view: stockholm, radiusMeters, onUserMove });
  return { ...leaflet, element, controller, onUserMove };
}

describe("createBorderMap", () => {
  it("opens at the given view with land, borders and Swedish zoom buttons", () => {
    const { fake, element } = setUp();
    expect(fake.map).toHaveBeenCalledWith(element, expect.objectContaining({ center: [59.33, 18.07], zoom: 5 }));
    expect(fake.geoJSON).toHaveBeenCalledTimes(2);
    expect(fake.control.zoom).toHaveBeenCalledWith(expect.objectContaining({ zoomInTitle: "Zooma in", zoomOutTitle: "Zooma ut" }));
    expect(element.style.background).not.toBe("");
  });

  it("reports where the user moved the map, rounded to about a metre and within ±180°", () => {
    const { userMovesTo, onUserMove } = setUp();
    userMovesTo(67.855555555, 200.123456789, 7);
    expect(onUserMove).toHaveBeenCalledWith({ center: { lat: 67.85556, lng: -159.87654 }, zoom: 7 });
  });

  it("ignores a move that leaves the view as it was, such as a resized page", () => {
    const { userMovesTo, onUserMove } = setUp();
    userMovesTo(59.33, 18.07, 5);
    expect(onUserMove).not.toHaveBeenCalled();
  });

  it("goes back to the last view after the page is resized, instead of drifting", () => {
    const { map, onUserMove } = setUp();
    map.resize();
    expect(map.setView).toHaveBeenCalledWith([59.33, 18.07], 5, { animate: false });
    expect(onUserMove).not.toHaveBeenCalled();
  });

  it("moves to a new view from outside without reporting it as the user's", () => {
    const { controller, map, onUserMove } = setUp();
    controller.setView({ center: { lat: 67.85, lng: 20.23 }, zoom: 6 });
    expect(map.setView).toHaveBeenCalledWith([67.85, 20.23], 6, { animate: false });
    expect(onUserMove).not.toHaveBeenCalled();
  });

  it("keeps the asked-for view when Leaflet rounds a tiny move away", () => {
    const { controller, map, userMovesTo, onUserMove } = setUp();
    map.setView.mockImplementationOnce(() => userMovesTo(59.33, 18.07, 5));
    controller.setView({ center: { lat: 59.33, lng: 18.08 }, zoom: 5 });
    expect(onUserMove).not.toHaveBeenCalled();
    map.resize();
    expect(map.setView).toHaveBeenLastCalledWith([59.33, 18.08], 5, { animate: false });
  });

  it("stays put for the view it already shows", () => {
    const { controller, map } = setUp();
    controller.setView(stockholm);
    expect(map.setView).not.toHaveBeenCalled();
  });

  it("draws the radius around the pin and keeps it there while the map moves", () => {
    const { fake, circle, userMovesTo } = setUp(50_000);
    expect(fake.circle).toHaveBeenCalledWith(expect.objectContaining({ lat: 59.33 }), expect.objectContaining({ radius: 50_000 }));
    userMovesTo(60, 18, 5);
    expect(circle.setLatLng).toHaveBeenLastCalledWith(expect.objectContaining({ lat: 60, lng: 18 }));
  });

  it("redraws or removes the radius when it changes", () => {
    const { controller, fake, circle } = setUp(50_000);
    controller.setRadius(80_000);
    expect(circle.remove).toHaveBeenCalledTimes(1);
    expect(fake.circle).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ radius: 80_000 }));
    controller.setRadius(0);
    controller.setRadius(null);
    expect(fake.circle).toHaveBeenCalledTimes(2);
  });

  it("removes the map when destroyed", () => {
    const { controller, map } = setUp();
    controller.destroy();
    expect(map.remove).toHaveBeenCalled();
  });
});
