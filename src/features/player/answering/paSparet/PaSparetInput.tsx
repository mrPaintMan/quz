"use client";

import { useId, useState } from "react";
import { MAX_TYPED_TEXT_LENGTH } from "@/domain/answering/registry";
import { isBlank } from "@/domain/questionTypes/isBlank";
import { brakePointsOf } from "@/domain/questionTypes/paSparet/paSparetAnswering";
import { PA_SPARET_CLUE_POINTS } from "@/domain/questionTypes/paSparet/paSparetRules";
import type { AnswerInputProps } from "@/features/player/answering/AnswerInputProps";
import { CluePointsCard, useClueIndex } from "./CluePointsCard";
import { EmergencyBrake } from "./EmergencyBrake";

// Once the brake is pulled: the guess, locked, with the points it was pulled at.
function Pulled({ guess, points }: { guess: string; points: number }) {
  return (
    <div className="flex flex-col gap-3.5">
      <section className="flex flex-col gap-1.5 rounded-2xl border-2 border-destructive bg-destructive/15 p-5">
        <p className="text-sm text-destructive">Ni drog i nödbromsen</p>
        <p className="text-3xl font-bold break-words">{guess}</p>
        <p className="text-lg font-semibold text-primary">på {points} poäng</p>
      </section>
      <p className="text-sm leading-relaxed text-muted-foreground">Svaret är låst. Luta er tillbaka och lyssna på resten av ledtrådarna.</p>
    </div>
  );
}

// The trip as in the wireframe (D63): what a brake is worth now, following the film; the guess,
// free to change; and the emergency brake, pulled by dragging its handle down, which sends the
// guess. The server decides the clue a brake counts at. A guess locked without a brake says so.
export function PaSparetInput({ answer, disabled, film = null, onChange, onSend, isSending = false }: AnswerInputProps<"paSparet">) {
  const id = useId();
  const index = useClueIndex(film);
  const [isMissing, setIsMissing] = useState(false);
  const guess = answer?.guess ?? "";
  const brakePoints = brakePointsOf(answer?.brakeClueIndex ?? null);

  if (brakePoints !== null) return <Pulled guess={guess} points={brakePoints} />;
  if (disabled) {
    return (
      <section className="flex flex-col gap-1.5 rounded-2xl border bg-card p-5">
        <p className="text-sm text-muted-foreground">Ert resmål</p>
        <p className="text-2xl font-semibold break-words">{guess}</p>
        <p className="text-muted-foreground">Ni bromsade inte.</p>
      </section>
    );
  }
  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <CluePointsCard index={index} />
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-sm text-muted-foreground">
          Vart är vi på väg?
        </label>
        <input
          id={id}
          value={guess}
          autoComplete="off"
          maxLength={MAX_TYPED_TEXT_LENGTH}
          placeholder="Skriv destinationen"
          onChange={(event) => {
            setIsMissing(false);
            onChange({ type: "paSparet", guess: event.target.value, brakeClueIndex: null });
          }}
          className="min-h-13 rounded-[14px] border-2 border-primary bg-card px-4 text-xl outline-none placeholder:text-muted-foreground"
        />
        {isMissing && (
          <p role="alert" className="text-sm text-destructive">
            Skriv ett svar innan ni drar i nödbromsen
          </p>
        )}
      </div>
      <EmergencyBrake
        points={PA_SPARET_CLUE_POINTS[index]}
        disabled={isSending}
        onPull={() => {
          if (isBlank(guess)) {
            setIsMissing(true);
            return false;
          }
          onSend?.({ type: "paSparet", guess, brakeClueIndex: null });
          return true;
        }}
      />
    </div>
  );
}
