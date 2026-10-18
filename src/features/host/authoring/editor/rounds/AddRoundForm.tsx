"use client";

import { useId, useState, type FormEvent } from "react";
import type { RoundKind } from "@convex/rounds/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AddRoundFormProps = { onAdd: (round: { title: string; kind: RoundKind }) => Promise<void> };

export function AddRoundForm({ onAdd }: AddRoundFormProps) {
  const titleId = useId();
  const kindId = useId();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<RoundKind>("questions");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onAdd({ title: title.trim() || (kind === "paSparet" ? "På spåret" : "Ny omgång"), kind });
    setTitle("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-xl border border-dashed p-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={titleId}>Ny omgång</Label>
        <Input id={titleId} placeholder="Till exempel Julmusik" value={title} onChange={(event) => setTitle(event.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={kindId}>Typ av omgång</Label>
        <select
          id={kindId}
          value={kind}
          onChange={(event) => setKind(event.target.value as RoundKind)}
          className="h-9 rounded-lg border bg-background pl-3 pr-9 text-sm"
        >
          <option value="questions">Frågeomgång</option>
          <option value="paSparet">På spåret</option>
        </select>
      </div>
      <Button type="submit" variant="outline">
        Lägg till omgång
      </Button>
    </form>
  );
}
