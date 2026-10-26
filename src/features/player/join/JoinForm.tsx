"use client";

import { useMutation, useQuery } from "convex/react";
import { useState, type FormEvent } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TEAM_COLOURS, type TeamColour } from "@/domain/teams/teamColours";
import { describeActionError } from "@/features/shared/errors/describeActionError";
import { TEAM_COLOUR_HEX, TEAM_COLOUR_NAMES } from "@/features/shared/teams/teamColourStyles";

type JoinFormProps = { gameId: Id<"games">; quizTitle: string; onJoined: (teamId: Id<"teams">) => void };

export function JoinForm({ gameId, quizTitle, onJoined }: JoinFormProps) {
  const teams = useQuery(api.teams.queries.listTeams, { gameId }) ?? [];
  const joinGame = useMutation(api.teams.mutations.joinGame);
  const [name, setName] = useState("");
  const [colour, setColour] = useState<TeamColour | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const taken = new Set(teams.map((team) => team.colour));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (colour === null || joining) return;
    setJoining(true);
    try {
      onJoined(await joinGame({ gameId, name, colour }));
    } catch (failure) {
      setError(describeActionError(failure));
    } finally {
      setJoining(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">Välkomna till</p>
        <h1 className="text-2xl font-semibold">{quizTitle}</h1>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="team-name">Lagets namn</Label>
        <Input id="team-name" value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Lagets färg</legend>
        <div className="grid grid-cols-6 gap-3">
          {TEAM_COLOURS.map((option) => (
            <label key={option} className="relative">
              <input
                type="radio"
                name="colour"
                value={option}
                disabled={taken.has(option)}
                checked={colour === option}
                onChange={() => setColour(option)}
                aria-label={taken.has(option) ? `${TEAM_COLOUR_NAMES[option]} (upptagen)` : TEAM_COLOUR_NAMES[option]}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className="block aspect-square rounded-full ring-offset-2 ring-offset-background peer-checked:ring-3 peer-checked:ring-foreground peer-focus-visible:ring-3 peer-focus-visible:ring-ring peer-disabled:opacity-20"
                style={{ background: TEAM_COLOUR_HEX[option] }}
              />
            </label>
          ))}
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={joining || name.trim() === "" || colour === null || taken.has(colour)}>
        Gå med
      </Button>
    </form>
  );
}
