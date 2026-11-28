"use client";

import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "@convex/_generated/api";
import type { Screen } from "@convex/games/screen";
import { screenKey } from "@/domain/screenSequence/isSameScreen";

// A film being downloaded, and once done, a link to the browser's own copy of it.
type Download = { controller: AbortController; copyUrl: string | null };

function drop(download: Download) {
  download.controller.abort();
  if (download.copyUrl !== null) URL.revokeObjectURL(download.copyUrl);
}

function readyCopies(downloads: Map<string, Download>): ReadonlyMap<string, string> {
  const ready = new Map<string, string>();
  for (const [key, { copyUrl }] of downloads) if (copyUrl !== null) ready.set(key, copyUrl);
  return ready;
}

// Downloads the next screen's film whole while the screen before it shows, so it plays at once
// without buffering (D73). Keeps at most two films: the one showing, if it was downloaded in
// time, and the next. A download still running when its screen shows is stopped, so it doesn't
// slow the film streaming in its place; one that fails just leaves the film to stream.
export function usePreloadFilms(screen: Screen): ReadonlyMap<string, string> {
  const getNextFilmUrl = useMutation(api.media.mutations.getNextFilmUrl);
  const downloads = useRef(new Map<string, Download>());
  const [ready, setReady] = useState<ReadonlyMap<string, string>>(new Map());
  // Every game update hands out a new but equal screen; act only when it really changes.
  const showingKey = screenKey(screen);

  useEffect(() => {
    let isCurrent = true;
    const all = downloads.current;
    for (const [key, download] of all) {
      if (key === showingKey && download.copyUrl !== null) continue;
      drop(download);
      all.delete(key);
    }
    setReady(readyCopies(all));

    async function downloadNextFilm() {
      const next = await getNextFilmUrl({ screen: Object.fromEntries(JSON.parse(showingKey)) as Screen });
      if (!isCurrent || next === null) return;
      const key = screenKey(next.screen);
      const download: Download = { controller: new AbortController(), copyUrl: null };
      all.set(key, download);
      const response = await fetch(next.url, { signal: download.controller.signal });
      if (!response.ok) throw new Error(`The film's download failed: ${response.status}`);
      const film = await response.blob();
      // Dropped while downloading: its screen showed first, or the game moved on.
      if (all.get(key) !== download) return;
      download.copyUrl = URL.createObjectURL(film);
      setReady(readyCopies(all));
    }
    downloadNextFilm().catch(() => {
      // Nothing to do: the film streams when its screen shows, as without downloading ahead.
    });
    return () => {
      isCurrent = false;
    };
  }, [getNextFilmUrl, showingKey]);

  useEffect(() => {
    const all = downloads.current;
    return () => {
      for (const download of all.values()) drop(download);
      all.clear();
    };
  }, []);

  return ready;
}
