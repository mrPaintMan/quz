import type { Id } from "@convex/_generated/dataModel";
import type { TeamColour } from "@/domain/teams/teamColours";
import { TeamDot } from "@/features/shared/teams/TeamDot";

type Team = { _id: Id<"teams">; name: string; colour: TeamColour };

// Which teams have sent their answer to the question on the TV, for the hosts; the TV shows only
// how many.
export function AnswerStatusList({ teams, answeredTeamIds }: { teams: Team[]; answeredTeamIds: Id<"teams">[] }) {
  if (teams.length === 0) return null;
  return (
    <section className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <h3 className="mb-1 font-semibold">Svar</h3>
      <ul className="flex flex-col">
        {teams.map((team) => {
          const hasAnswered = answeredTeamIds.includes(team._id);
          return (
            <li key={team._id} className="flex items-center gap-2 border-t py-1.5 first:border-t-0">
              <TeamDot colour={team.colour} />
              <span className="min-w-0 flex-1 truncate">{team.name}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${hasAnswered ? "bg-secondary text-foreground" : "text-primary ring-1 ring-primary"}`}>
                {hasAnswered ? "Svarat" : "Väntar"}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
