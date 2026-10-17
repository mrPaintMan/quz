import type { ComponentType } from "react";
import type { QuestionType } from "@convex/questions/questionContent";
import { ActivityEditor } from "@/features/host/authoring/questionEditors/activity/ActivityEditor";
import { DrawingEditor } from "@/features/host/authoring/questionEditors/drawing/DrawingEditor";
import { FreeTextEditor } from "@/features/host/authoring/questionEditors/freeText/FreeTextEditor";
import { IngredientsEditor } from "@/features/host/authoring/questionEditors/ingredients/IngredientsEditor";
import { ListEditor } from "@/features/host/authoring/questionEditors/list/ListEditor";
import { MapPinEditor } from "@/features/host/authoring/questionEditors/mapPin/MapPinEditor";
import { MatchEditor } from "@/features/host/authoring/questionEditors/match/MatchEditor";
import { MultipleChoiceEditor } from "@/features/host/authoring/questionEditors/multipleChoice/MultipleChoiceEditor";
import { NumberEditor } from "@/features/host/authoring/questionEditors/number/NumberEditor";
import { PaSparetEditor } from "@/features/host/authoring/questionEditors/paSparet/PaSparetEditor";
import type { QuestionEditorProps } from "@/features/host/authoring/questionEditors/QuestionEditorProps";
import { SortEditor } from "@/features/host/authoring/questionEditors/sort/SortEditor";

type EditorRegistration<T extends QuestionType> = { label: string; Editor: ComponentType<QuestionEditorProps<T>> };

// Typed as a complete map: a new question type does not compile until it has an editor here (D14).
export const questionEditors: { [T in QuestionType]: EditorRegistration<T> } = {
  multipleChoice: { label: "Flerval", Editor: MultipleChoiceEditor },
  freeText: { label: "Fritext", Editor: FreeTextEditor },
  number: { label: "Gissa siffran", Editor: NumberEditor },
  sort: { label: "Sortera", Editor: SortEditor },
  match: { label: "Para ihop", Editor: MatchEditor },
  list: { label: "Lista så många ni kan", Editor: ListEditor },
  ingredients: { label: "Gissa ingredienserna", Editor: IngredientsEditor },
  drawing: { label: "Rita svar", Editor: DrawingEditor },
  mapPin: { label: "Närmast på kartan", Editor: MapPinEditor },
  paSparet: { label: "På spåret", Editor: PaSparetEditor },
  activity: { label: "Aktivitet", Editor: ActivityEditor },
};
