import { TeamList, type TvTeam } from "./TeamList";
import { TvFrame } from "./TvFrame";

// Points come with grading in M3; until then the teams are listed as they joined.
export function LeaderboardScreen({ title, teams }: { title: string; teams: TvTeam[] }) {
  return (
    <TvFrame title={title}>
      <TeamList teams={teams} emptyText="Inga lag har anmält sig." />
    </TvFrame>
  );
}
