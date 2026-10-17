import type { ContentOf } from "@convex/questions/questionContent";
import { problemIf } from "@/domain/questionTypes/problemIf";
import { problemIfNotPositive } from "@/domain/questionTypes/problemIfNotPositive";
import type { QuestionTypeRules } from "@/domain/questionTypes/questionTypeRules";

type MapPinContent = ContentOf<"mapPin">;
type Coordinates = MapPinContent["target"];

const MIN_ZOOM = 0;
const MAX_ZOOM = 20;

function isValidZoom(zoom: number): boolean {
  return zoom >= MIN_ZOOM && zoom <= MAX_ZOOM;
}

function isOnEarth({ lat, lng }: Coordinates): boolean {
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

export const mapPinRules: QuestionTypeRules<MapPinContent> = {
  requiresTimeLimit: false,
  maxPoints: (content) => content.points,
  findProblems: (content) => [
    ...problemIf(!isOnEarth(content.target), "Placera målet på kartan."),
    ...problemIfNotPositive(content.radiusMeters, "Radien måste vara större än 0."),
    ...problemIfNotPositive(content.points),
    ...problemIf(!isOnEarth(content.initialView.center), "Välj var kartan ska börja."),
    ...problemIf(!isValidZoom(content.initialView.zoom), `Välj en zoomnivå mellan ${MIN_ZOOM} och ${MAX_ZOOM}.`),
  ],
};
