"use client";

import { useId, useState } from "react";
import type { QuestionType } from "@convex/questions/questionContent";
import type { RoundKind } from "@convex/rounds/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { allowedQuestionTypes } from "@/domain/rounds/allowedQuestionTypes";
import { questionEditors } from "@/features/host/authoring/questionEditors/registry";

type QuestionTypeSelectProps = {
  value: QuestionType;
  roundKind: RoundKind;
  onChange: (type: QuestionType) => void;
};

// Changing type throws away what was written, so the hosts confirm first (D22).
export function QuestionTypeSelect({ value, roundKind, onChange }: QuestionTypeSelectProps) {
  const id = useId();
  const [pendingType, setPendingType] = useState<QuestionType | null>(null);
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>Frågetyp</Label>
      <select
        id={id}
        value={value}
        onChange={(event) => setPendingType(event.target.value as QuestionType)}
        className="h-9 rounded-lg border bg-background pl-3 pr-9 text-sm"
      >
        {allowedQuestionTypes(roundKind).map((type) => (
          <option key={type} value={type}>
            {questionEditors[type].label}
          </option>
        ))}
      </select>
      <AlertDialog open={pendingType !== null} onOpenChange={(open) => !open && setPendingType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Byt till {pendingType && questionEditors[pendingType].label}?</AlertDialogTitle>
            <AlertDialogDescription>
              Svar, alternativ och poäng för frågan försvinner. Frågetexten, tidsgränsen och anteckningarna finns kvar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (pendingType) onChange(pendingType);
                setPendingType(null);
              }}
            >
              Byt frågetyp
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
