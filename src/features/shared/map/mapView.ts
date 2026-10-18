import type { ContentOf } from "@convex/questions/questionContent";

export type MapView = ContentOf<"mapPin">["initialView"];
export type Coordinates = MapView["center"];
