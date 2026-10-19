"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { CenterPin } from "@/features/shared/map/CenterPin";
import { createBorderMap, type BorderMapController } from "@/features/shared/map/createBorderMap";
import { borderDetailForZoom } from "@/features/shared/map/borderDetailForZoom";
import { loadBorderShapes } from "@/features/shared/map/loadBorderShapes";
import type { MapView } from "@convex/questions/types/mapPin/mapPinContent";

type BorderMapProps = {
  label: string;
  view: MapView;
  // Called when the user moves the map; the pin in the middle points at view.center.
  onViewChange: (view: MapView) => void;
  // Draws a circle of this radius around the pin.
  radiusMeters?: number | null;
  className?: string;
};

// A map with country borders only and a fixed pin in the middle: move the map to aim the pin.
export function BorderMap({ label, view, onViewChange, radiusMeters = null, className }: BorderMapProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<BorderMapController | null>(null);
  const [failed, setFailed] = useState(false);
  const latest = useRef({ view, radiusMeters, onViewChange });
  useEffect(() => {
    latest.current = { view, radiusMeters, onViewChange };
  });

  useEffect(() => {
    let cancelled = false;
    // Leaflet needs the browser's window, so it is loaded only once the page runs there.
    const detail = borderDetailForZoom(latest.current.view.zoom);
    Promise.all([import("leaflet"), loadBorderShapes(detail)]).then(([leaflet, shapes]) => {
      if (cancelled || !elementRef.current) return;
      // The view may have changed while loading; the map swaps borders if the zoom now needs others.
      const { view: startView, radiusMeters: startRadius } = latest.current;
      controllerRef.current = createBorderMap(leaflet.default ?? leaflet, elementRef.current, { detail, shapes }, {
        view: startView,
        radiusMeters: startRadius,
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

  return (
    <div role="group" aria-label={label} className={`relative overflow-hidden rounded-xl border border-border bg-background ${className ?? ""}`}>
      <div ref={elementRef} data-testid="border-map" className="absolute inset-0" />
      <CenterPin />
      {failed && (
        <p role="alert" className="absolute inset-x-0 top-4 z-[600] text-center text-sm text-destructive">
          Kartan kunde inte laddas. Ladda om sidan.
        </p>
      )}
    </div>
  );
}
