"use client";

import { useId } from "react";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { useHostMutation } from "@/features/host/shared/useHostMutation";

// Makes the quiz a Julquiz, whose TV and phones get the Christmas look (D75). Saved at once.
export function JulquizSwitch({ quiz }: { quiz: Doc<"quizzes"> }) {
  const id = useId();
  const updateQuiz = useHostMutation(api.quizzes.mutations.updateQuiz);
  const run = useRunAction();
  return (
    <div className="flex items-center gap-2" title="Julbelysning, granar och granris på TV:n och mobilerna">
      <Switch id={id} checked={quiz.isChristmas === true} onCheckedChange={(checked) => run(() => updateQuiz({ quizId: quiz._id, isChristmas: checked }))} />
      <Label htmlFor={id} className="text-sm">
        Julquiz
      </Label>
    </div>
  );
}
