"use client";

import { useEffect, useRef, useState } from "react";

// Saves value delayMs after it stops changing, and saves any pending change on unmount,
// so switching question or page never loses typing. saveFailed stays true until a save works.
export function useAutosave<T>(value: T, save: (value: T) => Promise<unknown>, delayMs = 600): { saveFailed: boolean } {
  const [saveFailed, setSaveFailed] = useState(false);
  const saveRef = useRef(save);
  const pending = useRef<{ value: T } | null>(null);
  const isFirstValue = useRef(true);

  useEffect(() => {
    saveRef.current = (next) =>
      save(next).then(
        () => setSaveFailed(false),
        () => setSaveFailed(true),
      );
  });

  useEffect(() => {
    if (isFirstValue.current) {
      isFirstValue.current = false;
      return;
    }
    pending.current = { value };
    const timer = setTimeout(() => {
      pending.current = null;
      void saveRef.current(value);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  useEffect(
    () => () => {
      if (pending.current) {
        void saveRef.current(pending.current.value);
      }
    },
    [],
  );

  return { saveFailed };
}
