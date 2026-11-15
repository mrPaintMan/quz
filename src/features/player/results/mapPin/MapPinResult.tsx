"use client";

import { useState } from "react";
import type { MapView } from "@convex/questions/types/mapPin/mapPinContent";
import { BorderMap } from "@/features/shared/map/BorderMap";
import type { MapMarker } from "@/features/shared/map/createBorderMap";
import type { ResultViewProps } from "@/features/player/results/ResultViewProps";
import { glowDelay, PartEnd, resultClass } from "@/features/player/results/resultLook";
import { TeamDot } from "@/features/shared/teams/TeamDot";
import { TEAM_COLOUR_HEX } from "@/features/shared/teams/teamColourStyles";

// The same map as the TV's answer: the right place in gold with its radius, every team's pin in its
// colour, the team's own larger and always in its colour, free to move around (D60, D67). Below,
// the team's pin lit with its points when it scored, red when not, with how far off it was.
export function MapPinResult({ shown, answer, outcome, revealed, teamId }: ResultViewProps<"mapPin">) {
  const part = outcome.parts[0];
  const [view, setView] = useState<MapView>({ center: answer.pin ?? shown.initialView.center, zoom: shown.initialView.zoom });
  const others = (revealed?.pins ?? []).filter((pin) => pin.teamId !== teamId);
  const ownColour = revealed?.pins.find((pin) => pin.teamId === teamId)?.colour;
  const markers: MapMarker[] = [
    ...others.map(({ pin, colour }) => ({ at: pin, colour: TEAM_COLOUR_HEX[colour], kind: "pin" as const })),
    ...(answer.pin ? [{ at: answer.pin, colour: ownColour ? TEAM_COLOUR_HEX[ownColour] : "var(--primary)", kind: "own" as const }] : []),
    ...(revealed?.target ? [{ at: revealed.target, colour: "", kind: "target" as const }] : []),
  ];

  return (
    <div className="flex flex-col gap-2">
      {others.length > 0 && <p className="text-sm text-muted-foreground">Dra i kartan för att se de andra lagens nålar</p>}
      <BorderMap
        label="Karta med rätt plats och lagens nålar"
        view={view}
        onViewChange={setView}
        markers={markers}
        radiusMeters={revealed?.radiusMeters ?? null}
        circleAt={revealed?.target ?? null}
        centerPin={false}
        className="h-[45svh] min-h-64"
      />
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
