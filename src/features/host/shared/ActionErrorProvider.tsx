"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { describeActionError } from "@/features/shared/errors/describeActionError";

type RunAction = <T>(action: () => Promise<T>) => Promise<T | undefined>;

// Outside the provider (in isolated component tests) failures are swallowed, not shown.
const ActionErrorContext = createContext<RunAction>((action) => action().catch(() => undefined));

// Shows a message when a host action (create, copy, move, delete …) fails, instead of failing silently.
export function ActionErrorProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const run = useCallback<RunAction>(async (action) => {
    try {
      const result = await action();
      setMessage(null);
      return result;
    } catch (error) {
      setMessage(describeActionError(error));
      return undefined;
    }
  }, []);

  return (
    <ActionErrorContext.Provider value={run}>
      {children}
      {message && (
        <div
          role="alert"
          className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-lg items-center gap-3 rounded-xl border border-destructive/60 bg-card p-3 shadow-lg"
        >
          <p className="flex-1 text-sm">{message}</p>
          <Button variant="ghost" size="sm" onClick={() => setMessage(null)}>
            Stäng
          </Button>
        </div>
      )}
    </ActionErrorContext.Provider>
  );
}

export function useRunAction(): RunAction {
  return useContext(ActionErrorContext);
}
