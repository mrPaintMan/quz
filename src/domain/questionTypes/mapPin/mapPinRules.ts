import type { ContentOf } from "@convex/questions/questionContent";
import type { Coordinates } from "@convex/questions/types/mapPin/mapPinContent";
import { problemIf } from "@/domain/questionTypes/problemIf";
import { problemIfNotPositive } from "@/domain/questionTypes/problemIfNotPositive";
import type { QuestionTypeRules } from "@/domain/questionTypes/questionTypeRules";

type MapPinContent = ContentOf<"mapPin">;

const SWEDEN = { lat: 62, lng: 15 };

// Past zoom 10 the borders-only map (D27) gets too coarse to be useful.
export const MAP_ZOOM = { min: 1, max: 10 };

function isValidZoom(zoom: number): boolean {
  return zoom >= MAP_ZOOM.min && zoom <= MAP_ZOOM.max;
}

function isOnEarth({ lat, lng }: Coordinates): boolean {
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

export const mapPinRules: QuestionTypeRules<MapPinContent> = {
  requiresTimeLimit: false,
  createEmptyContent: () => ({
    type: "mapPin",
    target: null,
    radiusMeters: 50_000,
    points: 1,
    initialView: { center: SWEDEN, zoom: 4 },
  }),
  maxPoints: (content) => content.points,
  findProblems: (content) => [
    ...problemIf(content.target === null || !isOnEarth(content.target), "Placera målet på kartan."),
    ...problemIfNotPositive(content.radiusMeters, "Radien måste vara större än 0."),
    ...problemIfNotPositive(content.points),
    ...problemIf(!isOnEarth(content.initialView.center), "Välj var kartan ska börja."),
    ...problemIf(!isValidZoom(content.initialView.zoom), `Välj en zoomnivå mellan ${MAP_ZOOM.min} och ${MAP_ZOOM.max}.`),
  ],
};
