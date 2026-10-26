import type { ScreenView } from "@/domain/screenSequence/describeScreen";
import type { TeamColour } from "@/domain/teams/teamColours";
import { TeamDot } from "@/features/shared/teams/TeamDot";
import { phoneScreenText } from "./phoneScreenText";

type FollowGameProps = { team: { name: string; colour: TeamColour }; view: ScreenView };

// The team's phone during the game: it follows the TV by itself, so there is nothing to press.
export function FollowGame({ team, view }: FollowGameProps) {
  return (
    <main className="flex min-h-svh flex-col gap-8 p-5">
      <header className="flex items-center gap-2 font-semibold">
        <TeamDot colour={team.colour} />
        {team.name}
      </header>
      <p role="status" className="flex flex-1 items-center justify-center text-center text-2xl">
        {phoneScreenText(view)}
      </p>
    </main>
  );
}
