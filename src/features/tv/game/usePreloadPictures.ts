"use client";

import { useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "@convex/_generated/api";

// Loads the next screen's pictures in the background, so the browser has them when that screen
// shows (D57). Each is held only until the next screen changes, by then loaded and in the
// browser's cache; one still in the list isn't asked for again.
export function usePreloadPictures() {
  const urls = useQuery(api.games.queries.getNextPictureUrls);
  const loaded = useRef(new Map<string, HTMLImageElement>());
  useEffect(() => {
    const upcoming = new Map<string, HTMLImageElement>();
    for (const url of urls ?? []) {
      let picture = loaded.current.get(url);
      if (!picture) {
        picture = new Image();
        picture.src = url;
      }
      upcoming.set(url, picture);
    }
    loaded.current = upcoming;
  }, [urls]);
}
