import { v, type Infer } from "convex/values";
import { activityContent } from "./types/activity/activityContent";
import { drawingContent } from "./types/drawing/drawingContent";
import { freeTextContent } from "./types/freeText/freeTextContent";
import { ingredientsContent } from "./types/ingredients/ingredientsContent";
import { listContent } from "./types/list/listContent";
import { mapPinContent } from "./types/mapPin/mapPinContent";
import { matchContent } from "./types/match/matchContent";
import { multipleChoiceContent } from "./types/multipleChoice/multipleChoiceContent";
import { numberContent } from "./types/number/numberContent";
import { paSparetContent } from "./types/paSparet/paSparetContent";
import { sortContent } from "./types/sort/sortContent";

// Adding a question type: add its folder under ./types and one entry here (D14).
export const questionContent = v.union(
  multipleChoiceContent,
  freeTextContent,
  numberContent,
  sortContent,
  matchContent,
  listContent,
  ingredientsContent,
  drawingContent,
  mapPinContent,
  paSparetContent,
  activityContent,
);

export type QuestionContent = Infer<typeof questionContent>;
export type QuestionType = QuestionContent["type"];
export type ContentOf<T extends QuestionType> = Extract<QuestionContent, { type: T }>;
