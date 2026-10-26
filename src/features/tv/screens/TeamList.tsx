import type { TeamColour } from "@/domain/teams/teamColours";
import { TeamDot } from "@/features/shared/teams/TeamDot";

export type TvTeam = { _id: string; name: string; colour: TeamColour };

export function TeamList({ teams, emptyText }: { teams: TvTeam[]; emptyText: string }) {
  if (teams.length === 0) return <p className="text-[2vw] text-muted-foreground">{emptyText}</p>;
  return (
    <ul className="grid grid-cols-2 gap-[1.2vw]">
      {teams.map((team) => (
        <li key={team._id} className="flex items-center gap-[1.2vw] rounded-[1.2vw] border-2 bg-card px-[1.8vw] py-[1.2vw] text-[2vw] font-semibold">
          <TeamDot colour={team.colour} className="size-[1.4vw]" />
          <span className="truncate">{team.name}</span>
        </li>
      ))}
    </ul>
  );
}
