"use client";

import { useCallback, useEffect, useRef } from "react";
import type { AnswerContent } from "@convex/answers/answerContent";

// Long enough that typing saves once a pause, not once a key, so a large night stays cheap (D45).
export const DRAFT_SAVE_DELAY_MS = 1000;

// Saves a draft once the team has paused for a second. A draft still waiting is saved at once
// when the page is hidden (the phone locks or switches app, which stops timers) and when the
// question changes, so the fallback the answers lock to stays current (D16, D45).
export function useDraftSaver(save: (content: AnswerContent) => void) {
  const pending = useRef<{ content: AnswerContent; timer: ReturnType<typeof setTimeout> } | null>(null);
  const latestSave = useRef(save);
  useEffect(() => {
    latestSave.current = save;
  });

  // Stable across renders, as they only use refs, so the page listeners below are set up once.
  const cancel = useCallback(() => {
    if (pending.current) clearTimeout(pending.current.timer);
    pending.current = null;
  }, []);

  const flush = useCallback(() => {
    if (pending.current === null) return;
    const { content } = pending.current;
    cancel();
    latestSave.current(content);
  }, [cancel]);

  const schedule = useCallback(
    (content: AnswerContent) => {
      cancel();
      pending.current = { content, timer: setTimeout(flush, DRAFT_SAVE_DELAY_MS) };
    },
    [cancel, flush],
  );

  useEffect(() => {
    const flushWhenHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", flushWhenHidden);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", flushWhenHidden);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [flush]);

  return { schedule, cancel };
}
