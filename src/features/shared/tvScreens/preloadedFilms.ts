"use client";

import { createContext, useContext } from "react";
import type { Screen } from "@convex/games/screen";
import { screenKey } from "@/domain/screenSequence/isSameScreen";

// Films the TV has downloaded ahead, by the screen that plays them (`screenKey`), as links to
// the browser's own copy (D73). Empty outside the TV, so the hosts' small copies download nothing.
export const PreloadedFilms = createContext<ReadonlyMap<string, string>>(new Map());

// The downloaded copy of the screen's film, or null when it isn't downloaded.
export function usePreloadedFilm(screen: Screen): string | null {
  return useContext(PreloadedFilms).get(screenKey(screen)) ?? null;
}
