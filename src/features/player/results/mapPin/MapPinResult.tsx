"use client";

import { useState } from "react";
import type { MapView } from "@convex/questions/types/mapPin/mapPinContent";
import { BorderMap } from "@/features/shared/map/BorderMap";
import type { MapMarker } from "@/features/shared/map/createBorderMap";
import { PIN_GOLD } from "@/features/shared/map/pinColours";
import type { ResultViewProps } from "@/features/player/results/ResultViewProps";
import { glowDelay, PartEnd, resultClass } from "@/features/player/results/resultLook";
import { TeamDot } from "@/features/shared/teams/TeamDot";
import { TEAM_COLOUR_HEX } from "@/features/shared/teams/teamColourStyles";

// The team's pin on the map as it placed it, with every other team's pin in its colour, and the
// map free to move around to look at them; the team's pin glows gold with its points when it
// scored, and says how far off it was. The right place is the TV's to show (D60).
export function MapPinResult({ shown, answer, outcome, revealed, teamId }: ResultViewProps<"mapPin">) {
  const part = outcome.parts[0];
  const scored = part?.result === "right";
  const [view, setView] = useState<MapView>({ center: answer.pin ?? shown.initialView.center, zoom: shown.initialView.zoom });
  const others = (revealed?.pins ?? []).filter((pin) => pin.teamId !== teamId);
  const ownColour = revealed?.pins.find((pin) => pin.teamId === teamId)?.colour;
  const markers: MapMarker[] = [
    ...others.map(({ pin, colour }) => ({ at: pin, colour: TEAM_COLOUR_HEX[colour], kind: "pin" as const })),
    ...(answer.pin ? [{ at: answer.pin, colour: scored || !ownColour ? PIN_GOLD : TEAM_COLOUR_HEX[ownColour], kind: scored ? ("highlight" as const) : ("own" as const) }] : []),
  ];

  return (
    <div className="flex flex-col gap-2">
      {others.length > 0 && <p className="text-sm text-muted-foreground">Dra i kartan för att se de andra lagens nålar</p>}
      <BorderMap label="Karta med lagens nålar" view={view} onViewChange={setView} markers={markers} centerPin={false} className="h-[45svh] min-h-64" />
      <div key={part?.result} style={glowDelay(0)} className={`flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 text-lg ${resultClass(part?.result)}`}>
        <span className="flex min-w-0 flex-1 flex-col">
          Er nål
          <span className="text-sm opacity-80">{part?.given}</span>
        </span>
        <PartEnd part={part} />
      </div>
      {others.length > 0 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {others.map((pin) => (
            <li key={pin.teamId} className="flex items-center gap-1.5">
              <TeamDot colour={pin.colour} />
              {pin.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
