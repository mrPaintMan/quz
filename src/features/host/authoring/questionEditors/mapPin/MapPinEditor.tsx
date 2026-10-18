"use client";

import { useState } from "react";
import { NumberField } from "@/features/host/authoring/questionEditors/fields/NumberField";
import type { QuestionEditorProps } from "@/features/host/authoring/questionEditors/QuestionEditorProps";
import { BorderMap } from "@/features/shared/map/BorderMap";
import { isSameView } from "@/features/shared/map/isSameView";
import type { Coordinates } from "@/features/shared/map/mapView";

const METERS_PER_KM = 1000;

const isPlaced = (target: Coordinates | null): target is Coordinates =>
  target !== null && Number.isFinite(target.lat) && Number.isFinite(target.lng);

// The hosts set the answer the way the deltagarna give theirs: by moving the map under a fixed pin.
export function MapPinEditor({ content, onChange }: QuestionEditorProps<"mapPin">) {
  // How far the hosts zoom while placing the answer isn't part of the question, so it isn't saved.
  const [answerZoom, setAnswerZoom] = useState(content.initialView.zoom);
  const target = content.target ?? { lat: Number.NaN, lng: Number.NaN };
  const setTarget = (next: { lat: number; lng: number }) =>
    onChange({ ...content, target: Number.isNaN(next.lat) && Number.isNaN(next.lng) ? null : next });
  const placedTarget = isPlaced(content.target) ? content.target : null;
  const answerView = { center: placedTarget ?? content.initialView.center, zoom: answerZoom };

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-medium">Rätt svar</legend>
        <p className="text-sm text-muted-foreground">
          Dra kartan så att nålen pekar på rätt plats. Den gula cirkeln visar hur nära deltagarna måste komma för att
          få poäng. Kartan har inga ortnamn, så klistra gärna in latitud och longitud från till exempel Google Maps.
        </p>
        <BorderMap
          label="Karta för rätt svar"
          view={answerView}
          radiusMeters={placedTarget ? content.radiusMeters : null}
          onViewChange={(view) => {
            setAnswerZoom(view.zoom);
            // Zooming alone keeps the pin where it was, so it neither moves nor places the answer.
            if (!isSameView(view, { ...answerView, zoom: view.zoom })) onChange({ ...content, target: view.center });
          }}
          className="h-96 w-full"
        />
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
      </fieldset>
      <NumberField label="Poäng inom radien" value={content.points} onChange={(points) => onChange({ ...content, points })} className="max-w-48" />
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-medium">Där kartan börjar på mobilen</legend>
        <p className="text-sm text-muted-foreground">
          Så här ser deltagarna kartan när frågan börjar, i mobilens storlek. Välj en vy som inte avslöjar svaret.
        </p>
        <BorderMap
          label="Karta för mobilens startvy"
          view={content.initialView}
          onViewChange={(initialView) => onChange({ ...content, initialView })}
          className="h-[470px] w-[350px] max-w-full"
        />
      </fieldset>
    </div>
  );
}
