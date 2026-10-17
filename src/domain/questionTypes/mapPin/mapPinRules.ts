import type { ContentOf } from "@convex/questions/questionContent";
import { problemIf } from "../problemIf";
import type { QuestionTypeRules } from "../questionTypeRules";

type MapPinContent = ContentOf<"mapPin">;
type Coordinates = MapPinContent["target"];

function isOnEarth({ lat, lng }: Coordinates): boolean {
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

export const mapPinRules: QuestionTypeRules<MapPinContent> = {
  requiresTimeLimit: false,
  maxPoints: (content) => content.points,
  findProblems: (content) => [
    ...problemIf(!isOnEarth(content.target), "Placera målet på kartan."),
    ...problemIf(content.radiusMeters <= 0, "Radien måste vara större än 0."),
    ...problemIf(content.points <= 0, "Poängen måste vara större än 0."),
    ...problemIf(!isOnEarth(content.initialView.center), "Välj var kartan ska börja."),
  ],
};
