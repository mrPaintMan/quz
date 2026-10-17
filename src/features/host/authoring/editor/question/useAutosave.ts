"use client";

import { useEffect, useRef } from "react";

// Saves value delayMs after it stops changing, and saves any pending change on unmount,
// so switching question or page never loses typing.
export function useAutosave<T>(value: T, save: (value: T) => void, delayMs = 600): void {
  const saveRef = useRef(save);
  const pending = useRef<{ value: T } | null>(null);
  const isFirstValue = useRef(true);

  useEffect(() => {
    saveRef.current = save;
  });

  useEffect(() => {
    if (isFirstValue.current) {
      isFirstValue.current = false;
      return;
    }
    pending.current = { value };
    const timer = setTimeout(() => {
      pending.current = null;
      saveRef.current(value);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  useEffect(
    () => () => {
      if (pending.current) {
        saveRef.current(pending.current.value);
      }
    },
    [],
  );
}
