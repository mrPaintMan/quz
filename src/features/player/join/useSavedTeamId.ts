"use client";

import { useSyncExternalStore } from "react";

const KEY = "quz.teamId";
const listeners = new Set<() => void>();
// Used when the browser refuses storage (some private modes), so joining still works this visit.
let unstoredTeamId: string | null = null;

function read(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return unstoredTeamId;
  }
}

function save(teamId: string | null) {
  unstoredTeamId = teamId;
  try {
    if (teamId === null) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, teamId);
  } catch {
    // Kept in unstoredTeamId instead; the team rejoins after a refresh.
  }
  listeners.forEach((listener) => listener());
}

// Also follows other tabs on the same phone, which change storage through the storage event.
function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

// The team this phone joined as, kept so it can rejoin after a refresh (D3). undefined while
// rendering on the server, which can't see the phone's storage.
export function useSavedTeamId(): [string | null | undefined, (teamId: string | null) => void] {
  const teamId = useSyncExternalStore(subscribe, read, () => undefined);
  return [teamId, save];
}
