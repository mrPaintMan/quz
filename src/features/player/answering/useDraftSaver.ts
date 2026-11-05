"use client";

import { useCallback, useEffect, useRef } from "react";
import type { AnswerContent } from "@convex/answers/answerContent";

// Long enough that typing saves once a pause, not once a key, so a large night stays cheap (D45).
export const DRAFT_SAVE_DELAY_MS = 1000;

// Saves a draft once the team has paused for a second, or at once with `saveNow` when that second
// could be too late. A draft still waiting is also sent when the page is hidden (the phone locks
// or switches app, which stops timers); that is best effort, as the phone may freeze the page
// before the save leaves it (D16, D45).
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

  const saveNow = useCallback(
    (content: AnswerContent) => {
      cancel();
      latestSave.current(content);
    },
    [cancel],
  );

  useEffect(() => {
    const flushWhenHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", flushWhenHidden);
    window.addEventListener("pagehide", flush);
    // No save on unmount: the question only goes when the hosts have moved on, and the server
    // then refuses drafts for it.
    return () => {
      cancel();
      document.removeEventListener("visibilitychange", flushWhenHidden);
      window.removeEventListener("pagehide", flush);
    };
  }, [cancel, flush]);

  return { schedule, saveNow, cancel };
}
