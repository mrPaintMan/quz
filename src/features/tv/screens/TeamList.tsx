import type { TeamColour } from "@/domain/teams/teamColours";
import { TeamDot } from "@/features/shared/teams/TeamDot";

export type TvTeam = { _id: string; name: string; colour: TeamColour };

// Measured on the lobby: twelve teams of typical names fit at the normal size, twelve of the
// longest allowed names only at the compact one.
const COMPACT_FROM_TOTAL_LENGTH = 200;

const nameSize = (teams: TvTeam[]) =>
  teams.reduce((total, team) => total + team.name.length, 0) > COMPACT_FROM_TOTAL_LENGTH ? "text-[1.5cqw]" : "text-[2cqw]";

// Teams flow side by side and wrap like words, so all twelve fit the lobby; a name never breaks
// from its dot.
export function TeamList({ teams, emptyText }: { teams: TvTeam[]; emptyText: string }) {
  if (teams.length === 0) return <p className="text-[2cqw] text-muted-foreground">{emptyText}</p>;
  return (
    <ul className="flex flex-wrap gap-x-[3cqw] gap-y-[1.4cqw]">
      {teams.map((team) => (
        <li key={team._id} className={`flex max-w-full items-center gap-[1cqw] font-semibold whitespace-nowrap ${nameSize(teams)}`}>
          <TeamDot colour={team.colour} className="size-[1.4cqw]" />
          <span className="truncate">{team.name}</span>
        </li>
      ))}
    </ul>
  );
}
