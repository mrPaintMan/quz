"use client";

import { useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "@convex/_generated/api";

// Loads the next screen's pictures in the background, so the browser has them when that screen
// shows (D57). Each picture is loaded once and kept, also if the hosts step back; a quiz has few.
export function usePreloadPictures() {
  const urls = useQuery(api.games.queries.getNextPictureUrls);
  const loaded = useRef(new Map<string, HTMLImageElement>());
  useEffect(() => {
    for (const url of urls ?? []) {
      if (loaded.current.has(url)) continue;
      const picture = new Image();
      picture.src = url;
      loaded.current.set(url, picture);
    }
  }, [urls]);
}
