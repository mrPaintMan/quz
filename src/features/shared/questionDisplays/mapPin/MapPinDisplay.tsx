"use client";

import { formatDistance } from "@/domain/questionTypes/mapPin/distanceMeters";
import { formatPoints } from "@/domain/scoring/formatPoints";
import { BorderMap } from "@/features/shared/map/BorderMap";
import type { MapMarker } from "@/features/shared/map/createBorderMap";
import type { RevealedDisplayProps } from "@/features/shared/questionDisplays/QuestionDisplayProps";
import { TeamDot } from "@/features/shared/teams/TeamDot";
import { TEAM_COLOUR_HEX } from "@/features/shared/teams/teamColourStyles";

// The teams answer on their own maps, so the question needs nothing beyond its prompt; the map's
// starting view stays hidden until the answer (D60).
export function MapPinQuestion() {
  return null;
}

// The right place with its scoring radius in gold, every team's pin in its colour, the map zoomed to
// show them all, and the teams from most points and closest, each with how far off it was (D60).
export function MapPinAnswer({ revealed }: RevealedDisplayProps<"mapPin">) {
  const markers: MapMarker[] = [
    ...revealed.pins.map(({ pin, colour }) => ({ at: pin, colour: TEAM_COLOUR_HEX[colour], kind: "pin" as const })),
    ...(revealed.target ? [{ at: revealed.target, colour: "", kind: "target" as const }] : []),
  ];
  return (
    <div className="flex min-h-0 flex-1 gap-[2cqw]">
      <BorderMap
        label="Rätt plats och lagens nålar"
        view={revealed.initialView}
        onViewChange={() => undefined}
        radiusMeters={revealed.radiusMeters}
        circleAt={revealed.target}
        markers={markers}
        centerPin={false}
        fitToMarkers
        className="min-h-0 flex-1"
      />
      {revealed.pins.length > 0 && (
        <ol className="flex w-[26cqw] shrink-0 flex-col gap-[0.6cqw] text-[1.7cqw]">
          {revealed.pins.map((pin) => (
            <li key={pin.teamId} className="flex items-center gap-[0.8cqw]">
              <TeamDot colour={pin.colour} className="size-[1.4cqw]" />
              <span className="min-w-0 flex-1 truncate">{pin.name}</span>
              <span className="text-muted-foreground">{formatDistance(pin.distanceMeters)}</span>
              {pin.points > 0 && <span className="font-semibold text-primary">+{formatPoints(pin.points)}</span>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
