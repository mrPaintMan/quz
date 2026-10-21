import { normalizeForComparison } from "@/domain/questionTypes/normalizeForComparison";
import { isBlank } from "@/domain/questionTypes/isBlank";
import { problemIf } from "@/domain/questionTypes/problemIf";
import type { Problem } from "@/domain/questionTypes/questionTypeRules";
import { TEAM_COLOURS, type TeamColour } from "@/domain/teams/teamColours";

export const MAX_TEAM_NAME_LENGTH = 30;

type Team = { name: string; colour: TeamColour };

// Why a team can't join with this name and colour; empty means it can.
export function findTeamProblems(team: Team, joinedTeams: Team[]): Problem[] {
  if (joinedTeams.length >= TEAM_COLOURS.length) {
    return [{ message: `Quizet är fullt: ${TEAM_COLOURS.length} lag har redan anmält sig.` }];
  }
  const name = normalizeForComparison(team.name);
  return [
    ...problemIf(isBlank(team.name), "Skriv lagets namn."),
    ...problemIf([...name].length > MAX_TEAM_NAME_LENGTH, `Lagets namn får vara högst ${MAX_TEAM_NAME_LENGTH} tecken.`),
    ...problemIf(
      joinedTeams.some((joined) => normalizeForComparison(joined.name) === name),
      "Ett annat lag heter redan så. Välj ett annat namn.",
    ),
    ...problemIf(
      joinedTeams.some((joined) => joined.colour === team.colour),
      "Ett annat lag har redan den färgen. Välj en annan.",
    ),
  ];
}
