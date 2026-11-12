"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { CenterPin } from "@/features/shared/map/CenterPin";
import { createBorderMap, type BorderMapController, type MapMarker } from "@/features/shared/map/createBorderMap";
import { borderDetailForZoom } from "@/features/shared/map/borderDetailForZoom";
import { loadBorderShapes } from "@/features/shared/map/loadBorderShapes";
import type { Coordinates, MapView } from "@convex/questions/types/mapPin/mapPinContent";

type BorderMapProps = {
  label: string;
  view: MapView;
  // Called when the user moves the map; the pin in the middle points at view.center.
  onViewChange: (view: MapView) => void;
  // Draws a circle of this radius around the pin, or around circleAt when given.
  radiusMeters?: number | null;
  circleAt?: Coordinates | null;
  // Pins at their own places, such as the teams' answers (D60).
  markers?: MapMarker[];
  // The fixed pin in the middle, for aiming; left out on a map that only shows pins.
  centerPin?: boolean;
  className?: string;
};

// A map with country borders only and, by default, a fixed pin in the middle: move the map to aim
// the pin. It can also show pins at their own places, and be moved around to look at them.
export function BorderMap({ label, view, onViewChange, radiusMeters = null, circleAt = null, markers = [], centerPin = true, className }: BorderMapProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<BorderMapController | null>(null);
  const [failed, setFailed] = useState(false);
  const latest = useRef({ view, radiusMeters, circleAt, markers, onViewChange });
  useEffect(() => {
    latest.current = { view, radiusMeters, circleAt, markers, onViewChange };
  });

  useEffect(() => {
    let cancelled = false;
    // Leaflet needs the browser's window, so it is loaded only once the page runs there.
    const detail = borderDetailForZoom(latest.current.view.zoom);
    Promise.all([import("leaflet"), loadBorderShapes(detail)]).then(([leaflet, shapes]) => {
      if (cancelled || !elementRef.current) return;
      // The view may have changed while loading; the map swaps borders if the zoom now needs others.
      const { view: startView, radiusMeters: startRadius, circleAt: startCircleAt, markers: startMarkers } = latest.current;
      controllerRef.current = createBorderMap(leaflet.default ?? leaflet, elementRef.current, { detail, shapes }, {
        view: startView,
        radiusMeters: startRadius,
        circleAt: startCircleAt,
        markers: startMarkers,
        onUserMove: (next) => latest.current.onViewChange(next),
        loadShapes: loadBorderShapes,
      });
    }).catch(() => {
      if (!cancelled) setFailed(true);
    });
    return () => {
      cancelled = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, []);

  const { lat, lng } = view.center;
  useEffect(() => {
    controllerRef.current?.setView({ center: { lat, lng }, zoom: view.zoom });
  }, [lat, lng, view.zoom]);
  useEffect(() => {
    controllerRef.current?.setRadius(radiusMeters);
  }, [radiusMeters]);
  // Markers come as new arrays on every render; their contents decide when to redraw them.
  const markersKey = JSON.stringify(markers);
  useEffect(() => {
    controllerRef.current?.setMarkers(latest.current.markers);
  }, [markersKey]);

  return (
    <div role="group" aria-label={label} className={`relative overflow-hidden rounded-xl border border-border bg-background ${className ?? ""}`}>
      <div ref={elementRef} data-testid="border-map" className="absolute inset-0" />
      {centerPin && <CenterPin />}
      {failed && (
        <p role="alert" className="absolute inset-x-0 top-4 z-[600] text-center text-sm text-destructive">
          Kartan kunde inte laddas. Ladda om sidan.
        </p>
      )}
    </div>
  );
}
