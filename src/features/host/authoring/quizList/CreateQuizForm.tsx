"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseDecimal } from "@/domain/text/parseDecimal";

type CreateQuizFormProps = {
  defaultYear: number;
  onCreate: (quiz: { title: string; year: number }) => Promise<void>;
};

export function CreateQuizForm({ defaultYear, onCreate }: CreateQuizFormProps) {
  const [title, setTitle] = useState(`Julquiz ${defaultYear}`);
  const [year, setYear] = useState(String(defaultYear));
  const [pending, setPending] = useState(false);
  const parsedYear = parseDecimal(year);
  const validYear = parsedYear !== null && Number.isInteger(parsedYear) ? parsedYear : null;
  const canCreate = title.trim() !== "" && validYear !== null && !pending;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (validYear === null) return;
    setPending(true);
    await onCreate({ title: title.trim(), year: validYear }).finally(() => setPending(false));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
      <div className="flex min-w-48 flex-[3] flex-col gap-2">
        <Label htmlFor="new-quiz-title">Namn</Label>
        <Input id="new-quiz-title" value={title} onChange={(event) => setTitle(event.target.value)} />
      </div>
      <div className="flex min-w-24 flex-1 flex-col gap-2">
        <Label htmlFor="new-quiz-year">År</Label>
        <Input id="new-quiz-year" inputMode="numeric" value={year} onChange={(event) => setYear(event.target.value)} />
      </div>
      <Button type="submit" size="lg" disabled={!canCreate}>
        Skapa quiz
      </Button>
    </form>
  );
}
