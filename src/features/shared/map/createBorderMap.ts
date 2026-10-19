import type * as Leaflet from "leaflet";
import { MAP_ZOOM } from "@/domain/questionTypes/mapPin/mapPinRules";
import { borderDetailForZoom, type BorderDetail } from "@/features/shared/map/borderDetailForZoom";
import type { BorderShapes } from "@/features/shared/map/loadBorderShapes";
import { isSameView } from "@/features/shared/map/isSameView";
import type { MapView } from "@convex/questions/types/mapPin/mapPinContent";

type LeafletModule = typeof Leaflet;

export type BorderMapOptions = {
  view: MapView;
  radiusMeters: number | null;
  // Only moves made by the user (dragging, zooming, the keyboard) that change the view.
  onUserMove: (view: MapView) => void;
  // Fetches the borders for another zoom band when the map is zoomed into it.
  loadShapes: (detail: BorderDetail) => Promise<BorderShapes>;
};

// Borders already loaded, with the detail they were loaded at.
export type InitialBorders = { detail: BorderDetail; shapes: BorderShapes };

export type BorderMapController = {
  setView: (view: MapView) => void;
  setRadius: (radiusMeters: number | null) => void;
  destroy: () => void;
};

// Leaflet paints the shapes on a canvas, which can't read CSS variables, so the
// palette (D24) is repeated here.
const mapColors = {
  sea: "#120e14",
  land: "#322835",
  line: "#7a6880",
  radius: "#e8b04b",
};

// Five decimals is about a metre.
const roundCoordinate = (value: number) => Math.round(value * 1e5) / 1e5;

function readView(map: Leaflet.Map): MapView {
  // The world repeats sideways; wrap() keeps longitudes within ±180.
  const center = map.getCenter().wrap();
  return { center: { lat: roundCoordinate(center.lat), lng: roundCoordinate(center.lng) }, zoom: map.getZoom() };
}

function addBorders(L: LeafletModule, map: Leaflet.Map, shapes: BorderShapes): Leaflet.Layer[] {
  const lines = { color: mapColors.line, weight: 0.8, opacity: 1 };
  return [
    L.geoJSON(shapes.land, { interactive: false, style: { ...lines, fillColor: mapColors.land, fillOpacity: 1 } }).addTo(map),
    L.geoJSON(shapes.borders, { interactive: false, style: lines }).addTo(map),
  ];
}

export function createBorderMap(
  L: LeafletModule,
  element: HTMLElement,
  // Drawn straight away, so the map never opens blank; swapped if they don't suit the zoom.
  initialBorders: InitialBorders,
  { view, radiusMeters, onUserMove, loadShapes }: BorderMapOptions,
): BorderMapController {
  const map = L.map(element, {
    center: [view.center.lat, view.center.lng],
    zoom: view.zoom,
    minZoom: MAP_ZOOM.min,
    maxZoom: MAP_ZOOM.max,
    zoomSnap: 0.25,
    // Zoom around the pin, so zooming never changes what it points at. The scroll wheel
    // stays with the page, which would otherwise get stuck on a big map.
    touchZoom: "center",
    doubleClickZoom: "center",
    scrollWheelZoom: false,
    maxBounds: [[-85, -540], [85, 540]],
    maxBoundsViscosity: 1,
    renderer: L.canvas(),
    attributionControl: false,
    zoomControl: false,
  });
  element.style.background = mapColors.sea;
  L.control.zoom({ position: "topright", zoomInTitle: "Zooma in", zoomOutTitle: "Zooma ut" }).addTo(map);
  let borderLayers = addBorders(L, map, initialBorders.shapes);
  let shownDetail = initialBorders.detail;

  let circle: Leaflet.Circle | null = null;
  const setRadius = (meters: number | null) => {
    circle?.remove();
    circle = null;
    if (meters === null || !(meters > 0)) return;
    circle = L.circle(map.getCenter(), {
      radius: meters,
      interactive: false,
      color: mapColors.radius,
      weight: 2,
      fillColor: mapColors.radius,
      fillOpacity: 0.2,
    }).addTo(map);
  };
  setRadius(radiusMeters);

  // The old borders stay until the new ones have loaded, so the map is never blank; a load
  // that fails keeps them, and the next zoom tries again. By the time a load finishes the map
  // may have zoomed into yet another band, or been removed, and then the result is dropped.
  let removed = false;
  const showDetailForZoom = () => {
    const wanted = borderDetailForZoom(map.getZoom());
    if (wanted === shownDetail) return;
    loadShapes(wanted).then((next) => {
      if (removed || wanted !== borderDetailForZoom(map.getZoom()) || wanted === shownDetail) return;
      borderLayers.forEach((layer) => layer.remove());
      borderLayers = addBorders(L, map, next);
      shownDetail = wanted;
      // The canvas paints in the order layers were added; keep the radius above the land.
      circle?.bringToFront();
    }, () => undefined);
  };
  map.on("zoomend", showDetailForZoom);
  showDetailForZoom();

  // Leaflet also fires "moveend" for our own moves and when the page is resized; only a
  // move that changes the view and isn't ours counts as the user's. Leaflet pans in whole
  // pixels, so a tiny change from outside may not move the map at all: lastView keeps the
  // view we asked for, not the one Leaflet rounded to.
  let lastView = readView(map);
  let movingByCode = false;
  const showView = (view: MapView) => {
    lastView = view;
    movingByCode = true;
    map.setView([view.center.lat, view.center.lng], view.zoom, { animate: false });
    movingByCode = false;
  };
  map.on("move", () => circle?.setLatLng(map.getCenter()));
  // A resize keeps the centre only to the nearest pixel, kilometres when zoomed out.
  map.on("resize", () => showView(lastView));
  map.on("moveend", () => {
    const view = readView(map);
    if (movingByCode || isSameView(view, lastView)) return;
    lastView = view;
    onUserMove(view);
  });

  return {
    setView: (next) => {
      if (!isSameView(next, lastView)) showView(next);
    },
    setRadius,
    destroy: () => {
      removed = true;
      map.remove();
    },
  };
}
