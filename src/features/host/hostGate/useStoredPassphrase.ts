"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  clearStoredPassphrase,
  readStoredPassphrase,
  storePassphrase,
} from "@/features/host/shared/hostPassphraseStorage";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function notify() {
  listeners.forEach((listener) => listener());
}

// The server render has no storage, so it reports "unknown" (undefined) instead of guessing.
export function useStoredPassphrase() {
  const passphrase = useSyncExternalStore(subscribe, readStoredPassphrase, () => undefined);
  const remember = useCallback((value: string) => {
    storePassphrase(value);
    notify();
  }, []);
  const forget = useCallback(() => {
    clearStoredPassphrase();
    notify();
  }, []);
  return { passphrase, remember, forget };
}
