"use client";

import { useEffect, useRef } from "react";
import type { AnswerContent } from "@convex/answers/answerContent";

// Long enough to save typing a few times a second rather than on every key.
const SAVE_DELAY_MS = 400;

// Saves a draft once the team pauses, and saves one still waiting when the question changes, so
// typing reaches the server without a save per key (D41).
export function useDraftSaver(save: (content: AnswerContent) => Promise<unknown>) {
  const pending = useRef<{ content: AnswerContent; timer: ReturnType<typeof setTimeout> } | null>(null);
  const latestSave = useRef(save);
  useEffect(() => {
    latestSave.current = save;
  });

  const cancel = () => {
    if (pending.current) clearTimeout(pending.current.timer);
    pending.current = null;
  };

  const schedule = (content: AnswerContent) => {
    cancel();
    const timer = setTimeout(() => {
      pending.current = null;
      void latestSave.current(content);
    }, SAVE_DELAY_MS);
    pending.current = { content, timer };
  };

  useEffect(
    () => () => {
      if (pending.current === null) return;
      clearTimeout(pending.current.timer);
      void latestSave.current(pending.current.content);
    },
    [],
  );

  return { schedule, cancel };
}
