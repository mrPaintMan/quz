"use client";

import { useState } from "react";
import type { Coordinates } from "@convex/questions/types/mapPin/mapPinContent";
import { NumberField } from "@/features/host/authoring/questionEditors/fields/NumberField";
import type { QuestionEditorProps } from "@/features/host/authoring/questionEditors/QuestionEditorProps";
import { BorderMap } from "@/features/shared/map/BorderMap";
import { isSameView } from "@/features/shared/map/isSameView";

const METERS_PER_KM = 1000;

type TypedCoordinates = { lat: number | null; lng: number | null };

const toTarget = ({ lat, lng }: TypedCoordinates): Coordinates | null =>
  lat === null || lng === null ? null : { lat, lng };

// The hosts set the answer the way the deltagarna give theirs: by moving the map under a fixed pin.
export function MapPinEditor({ content, onChange }: QuestionEditorProps<"mapPin">) {
  // How far the hosts zoom while placing the answer isn't part of the question, so it isn't saved.
  const [answerZoom, setAnswerZoom] = useState(content.initialView.zoom);
  // Only a whole pair of coordinates is saved; a half-typed one stays here meanwhile.
  const [typedTarget, setTypedTarget] = useState<TypedCoordinates>(content.target ?? { lat: null, lng: null });
  const shownTarget = content.target ?? typedTarget;
  const typeTarget = (next: TypedCoordinates) => {
    setTypedTarget(next);
    onChange({ ...content, target: toTarget(next) });
  };
  const answerView = { center: content.target ?? content.initialView.center, zoom: answerZoom };
  const radiusKm = content.radiusMeters === null ? null : content.radiusMeters / METERS_PER_KM;

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
          radiusMeters={content.target ? content.radiusMeters : null}
          onViewChange={(view) => {
            setAnswerZoom(view.zoom);
            // Zooming alone keeps the pin where it was, so it neither moves nor places the answer.
            if (!isSameView(view, { ...answerView, zoom: view.zoom })) onChange({ ...content, target: view.center });
          }}
          className="h-96 w-full"
        />
        <div className="flex flex-wrap gap-3">
          <NumberField label="Latitud" value={shownTarget.lat} onChange={(lat) => typeTarget({ ...shownTarget, lat })} className="w-40" />
          <NumberField label="Longitud" value={shownTarget.lng} onChange={(lng) => typeTarget({ ...shownTarget, lng })} className="w-40" />
          <NumberField
            label="Radie (km)"
            value={radiusKm}
            onChange={(km) => onChange({ ...content, radiusMeters: km === null ? null : km * METERS_PER_KM })}
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
