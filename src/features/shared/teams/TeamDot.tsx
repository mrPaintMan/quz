import type { TeamColour } from "@/domain/teams/teamColours";
import { cn } from "cn";
import { TEAM_COLOUR_HEX } from "./teamColourStyles";

// A team's colour as a dot beside its name; decorative, since the name says which team it is.
export function TeamDot({ colour, className }: { colour: TeamColour; className?: string }) {
  return <span aria-hidden className={cn("inline-block size-3 shrink-0 rounded-full", className)} style={{ background: TEAM_COLOUR_HEX[colour] }} />;
}
