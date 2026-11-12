"use client";

import { useState } from "react";
import type { MapView } from "@convex/questions/types/mapPin/mapPinContent";
import type { AnswerInputProps } from "@/features/player/answering/AnswerInputProps";
import { BorderMap } from "@/features/shared/map/BorderMap";
import { PIN_GOLD } from "@/features/shared/map/pinColours";

// The team moves the map under a fixed pin in the middle, as the hosts placed the answer (D27),
// starting from the question's view; the pin's spot is the answer. Once locked, the answer stays
// as a pin and the map can still be looked around (D60).
export function MapPinInput({ shown, answer, disabled, onChange }: AnswerInputProps<"mapPin">) {
  const pin = answer?.pin ?? shown.initialView.center;
  const [view, setView] = useState<MapView>({ center: pin, zoom: shown.initialView.zoom });
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">{disabled ? "Ert svar" : "Flytta kartan så att nålen pekar på svaret"}</p>
      <BorderMap
        label="Karta för ert svar"
        view={view}
        onViewChange={(next) => {
          setView(next);
          if (!disabled) onChange({ type: "mapPin", pin: next.center });
        }}
        centerPin={!disabled}
        markers={disabled ? [{ at: pin, colour: PIN_GOLD, kind: "own" }] : []}
        className="h-[55svh] min-h-72"
      />
    </div>
  );
}
