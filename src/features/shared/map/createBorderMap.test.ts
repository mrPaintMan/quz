import type * as Leaflet from "leaflet";
import { describe, expect, it, vi } from "vitest";
import type { BorderDetail } from "./borderDetailForZoom";
import { createBorderMap } from "./createBorderMap";

const shapes = {
  land: { type: "FeatureCollection" as const, features: [] },
  borders: { type: "MultiLineString" as const, coordinates: [] },
};
const stockholm = { center: { lat: 59.33, lng: 18.07 }, zoom: 5 };

// Just enough of Leaflet to drive the map: moving it fires "move" and "moveend", and
// "zoomend" when the zoom changed, synchronously as Leaflet does without animation.
function fakeLeaflet() {
  const handlers: Record<string, () => void> = {};
  let center = { lat: 0, lng: 0 };
  let zoom = 0;
  const moveTo = (lat: number, lng: number, nextZoom: number) => {
    const zoomed = nextZoom !== zoom;
    center = { lat, lng };
    zoom = nextZoom;
    handlers.move?.();
    if (zoomed) handlers.zoomend?.();
    handlers.moveend?.();
  };
  const map = {
    on: (event: string, handler: () => void) => (handlers[event] = handler),
    getCenter: () => ({ ...center, wrap: () => ({ lat: center.lat, lng: ((((center.lng + 180) % 360) + 360) % 360) - 180 }) }),
    getZoom: () => zoom,
    setView: vi.fn(([lat, lng]: [number, number], nextZoom: number) => moveTo(lat, lng, nextZoom)),
    resize: () => handlers.resize?.(),
    remove: vi.fn(),
    fitBounds: vi.fn((bounds: { points: [number, number][] }) => moveTo(bounds.points[0][0], bounds.points[0][1], 7)),
  };
  const circle = { addTo: () => circle, setLatLng: vi.fn(), remove: vi.fn(), bringToFront: vi.fn(), getBounds: () => [[60, 15]] };
  const layers: { remove: ReturnType<typeof vi.fn> }[] = [];
  const zoomControl = { addTo: vi.fn() };
  const markers: { remove: ReturnType<typeof vi.fn> }[] = [];
  const L = {
    map: vi.fn((_element: HTMLElement, options: { center: [number, number]; zoom: number }) => {
      [center.lat, center.lng] = options.center;
      zoom = options.zoom;
      return map;
    }),
    canvas: vi.fn(),
    control: { zoom: vi.fn(() => zoomControl) },
    geoJSON: vi.fn(() => {
      const layer = { addTo: () => layer, remove: vi.fn() };
      layers.push(layer);
      return layer;
    }),
    circle: vi.fn(() => circle),
    divIcon: vi.fn((options: { html: string }) => options),
    latLngBounds: vi.fn((points: [number, number][]) => {
      const bounds = { points: [...points], extend: (more: [number, number][]) => bounds.points.push(...more) };
      return bounds;
    }),
    marker: vi.fn(() => {
      const marker = { addTo: () => marker, remove: vi.fn() };
      markers.push(marker);
      return marker;
    }),
  };
  return { L: L as unknown as typeof Leaflet, fake: L, map, circle, layers, markers, userMovesTo: moveTo };
}

function setUp(radiusMeters: number | null = null, loadShapes = vi.fn<(detail: BorderDetail) => Promise<typeof shapes>>(() => Promise.resolve(shapes))) {
  const leaflet = fakeLeaflet();
  const onUserMove = vi.fn();
  const element = document.createElement("div");
  const controller = createBorderMap(leaflet.L, element, { detail: "50m", shapes }, { view: stockholm, radiusMeters, onUserMove, loadShapes });
  return { ...leaflet, element, controller, onUserMove, loadShapes };
}

// Lets the promise callbacks of a finished load run.
const settle = () => new Promise((resolve) => setTimeout(resolve));

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

  it("swaps in finer borders when zoomed in past 6, keeping the radius on top", async () => {
    const { fake, layers, circle, loadShapes, userMovesTo } = setUp(50_000);
    userMovesTo(59.33, 18.07, 6);
    expect(loadShapes).toHaveBeenCalledWith("10m");
    await settle();
    expect(fake.geoJSON).toHaveBeenCalledTimes(4);
    expect(layers[0].remove).toHaveBeenCalled();
    expect(layers[1].remove).toHaveBeenCalled();
    expect(circle.bringToFront).toHaveBeenCalled();
  });

  it("loads the right borders straight away when the ones given don't suit the starting zoom", () => {
    const leaflet = fakeLeaflet();
    const loadShapes = vi.fn(() => Promise.resolve(shapes));
    createBorderMap(leaflet.L, document.createElement("div"), { detail: "10m", shapes }, { view: stockholm, radiusMeters: null, onUserMove: vi.fn(), loadShapes });
    expect(loadShapes).toHaveBeenCalledWith("50m");
  });

  it("keeps the borders it has while zooming within their range", () => {
    const { loadShapes, userMovesTo } = setUp();
    userMovesTo(59.33, 18.07, 1);
    expect(loadShapes).not.toHaveBeenCalled();
  });

  it("drops borders that arrive after the map zoomed back out", async () => {
    let finish = () => {};
    const { fake, loadShapes, userMovesTo } = setUp(null, vi.fn(() => new Promise<typeof shapes>((resolve) => (finish = () => resolve(shapes)))));
    userMovesTo(59.33, 18.07, 7);
    expect(loadShapes).toHaveBeenCalledWith("10m");
    userMovesTo(59.33, 18.07, 5);
    finish();
    await settle();
    expect(fake.geoJSON).toHaveBeenCalledTimes(2);
  });

  it("keeps the old borders when the finer ones can't be loaded, and tries again on the next zoom", async () => {
    const loadShapes = vi.fn<(detail: BorderDetail) => Promise<typeof shapes>>().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(shapes);
    const { fake, layers, userMovesTo } = setUp(null, loadShapes);
    userMovesTo(59.33, 18.07, 10);
    await settle();
    expect(fake.geoJSON).toHaveBeenCalledTimes(2);
    expect(layers[0].remove).not.toHaveBeenCalled();
    userMovesTo(59.33, 18.07, 11);
    await settle();
    expect(loadShapes).toHaveBeenCalledTimes(2);
    expect(fake.geoJSON).toHaveBeenCalledTimes(4);
  });

  it("draws nothing that arrives after the map was removed", async () => {
    const { controller, fake, userMovesTo } = setUp();
    userMovesTo(59.33, 18.07, 8);
    controller.destroy();
    await settle();
    expect(fake.geoJSON).toHaveBeenCalledTimes(2);
  });

  it("removes the map when destroyed", () => {
    const { controller, map } = setUp();
    controller.destroy();
    expect(map.remove).toHaveBeenCalled();
  });

  it("draws pins in their colours, the highlighted one larger, and replaces them when told", () => {
    const leaflet = fakeLeaflet();
    const options = { view: stockholm, radiusMeters: null, onUserMove: vi.fn(), loadShapes: vi.fn() };
    const markers = [
      { at: { lat: 59, lng: 18 }, colour: "#f00", kind: "pin" as const },
      { at: { lat: 60, lng: 17 }, colour: "#00f", kind: "highlight" as const },
      { at: { lat: 59.3, lng: 18.1 }, colour: "", kind: "target" as const },
    ];
    const controller = createBorderMap(leaflet.L, document.createElement("div"), { detail: "50m", shapes }, { ...options, markers });
    expect(leaflet.fake.marker).toHaveBeenCalledTimes(3);
    const icons = leaflet.fake.divIcon.mock.calls.map(([icon]) => icon as { html: string; iconSize: number[] });
    expect(icons[0].html).toContain('fill="#f00"');
    expect(icons[1].iconSize).toEqual([34, 44]);
    expect(icons[2].html).toContain("border-radius:50%");
    controller.setMarkers([]);
    expect(leaflet.markers.every((marker) => marker.remove.mock.calls.length === 1)).toBe(true);
  });

  it("keeps a circle at its own place instead of following the middle", () => {
    const leaflet = fakeLeaflet();
    createBorderMap(leaflet.L, document.createElement("div"), { detail: "50m", shapes }, {
      view: stockholm,
      radiusMeters: 50_000,
      circleAt: { lat: 60, lng: 15 },
      onUserMove: vi.fn(),
      loadShapes: vi.fn(() => Promise.resolve(shapes)),
    });
    expect(leaflet.fake.circle).toHaveBeenCalledWith([60, 15], expect.objectContaining({ radius: 50_000 }));
    leaflet.userMovesTo(61, 16, 5);
    expect(leaflet.circle.setLatLng).not.toHaveBeenCalled();
  });

  it("zooms to show the markers and the circle when asked, as a move of its own", () => {
    const leaflet = fakeLeaflet();
    const onUserMove = vi.fn();
    const controller = createBorderMap(leaflet.L, document.createElement("div"), { detail: "50m", shapes }, {
      view: stockholm,
      radiusMeters: 50_000,
      circleAt: { lat: 60, lng: 15 },
      markers: [{ at: { lat: 59, lng: 18 }, colour: "#f00", kind: "pin" }],
      fitToMarkers: true,
      onUserMove,
      loadShapes: vi.fn(() => Promise.resolve(shapes)),
    });
    expect(leaflet.map.fitBounds).toHaveBeenCalledWith({ points: [[59, 18], [60, 15]], extend: expect.any(Function) }, expect.objectContaining({ padding: [24, 24] }));
    expect(onUserMove).not.toHaveBeenCalled();
    controller.setCircleAt({ lat: 61, lng: 14 });
    expect(leaflet.fake.circle).toHaveBeenLastCalledWith([61, 14], expect.anything());
  });
});

