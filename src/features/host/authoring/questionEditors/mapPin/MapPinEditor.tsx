"use client";

import { NumberField } from "@/features/host/authoring/questionEditors/fields/NumberField";
import type { QuestionEditorProps } from "@/features/host/authoring/questionEditors/QuestionEditorProps";

const METERS_PER_KM = 1000;

function openStreetMapLink(lat: number, lng: number, zoom: number) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${Math.round(zoom)}/${lat}/${lng}`;
}

// Coordinates are typed in for now; a map to click on comes with the map question's phone view (M4).
export function MapPinEditor({ content, onChange }: QuestionEditorProps<"mapPin">) {
  const target = content.target ?? { lat: Number.NaN, lng: Number.NaN };
  const setTarget = (next: { lat: number; lng: number }) =>
    onChange({ ...content, target: Number.isNaN(next.lat) && Number.isNaN(next.lng) ? null : next });
  const { center, zoom } = content.initialView;

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Målet</legend>
        <p className="text-sm text-muted-foreground">
          Hitta platsen i OpenStreetMap eller Google Maps och skriv in latitud och longitud.
        </p>
        <div className="flex flex-wrap gap-3">
          <NumberField label="Latitud" value={content.target?.lat ?? null} onChange={(lat) => setTarget({ ...target, lat })} className="w-40" />
          <NumberField label="Longitud" value={content.target?.lng ?? null} onChange={(lng) => setTarget({ ...target, lng })} className="w-40" />
          <NumberField
            label="Radie (km)"
            value={content.radiusMeters / METERS_PER_KM}
            onChange={(km) => onChange({ ...content, radiusMeters: km * METERS_PER_KM })}
            className="w-32"
          />
        </div>
        {content.target && (
          <a
            href={openStreetMapLink(content.target.lat, content.target.lng, 9)}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Visa målet i OpenStreetMap
          </a>
        )}
      </fieldset>
      <NumberField label="Poäng inom radien" value={content.points} onChange={(points) => onChange({ ...content, points })} className="max-w-48" />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Där kartan börjar på mobilen</legend>
        <div className="flex flex-wrap gap-3">
          <NumberField label="Startlatitud" value={center.lat} onChange={(lat) => onChange({ ...content, initialView: { ...content.initialView, center: { ...center, lat } } })} className="w-40" />
          <NumberField label="Startlongitud" value={center.lng} onChange={(lng) => onChange({ ...content, initialView: { ...content.initialView, center: { ...center, lng } } })} className="w-40" />
          <NumberField label="Zoom (0–20)" value={zoom} onChange={(value) => onChange({ ...content, initialView: { ...content.initialView, zoom: value } })} className="w-32" />
        </div>
      </fieldset>
    </div>
  );
}
