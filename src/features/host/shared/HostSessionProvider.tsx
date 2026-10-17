"use client";

import { createContext, useContext, type ReactNode } from "react";

type HostSession = { passphrase: string; logOut: () => void };

const HostSessionContext = createContext<HostSession | null>(null);

export function HostSessionProvider({ session, children }: { session: HostSession; children: ReactNode }) {
  return <HostSessionContext.Provider value={session}>{children}</HostSessionContext.Provider>;
}

export function useHostSession(): HostSession {
  const session = useContext(HostSessionContext);
  if (session === null) {
    throw new Error("useHostSession must be used inside HostGate.");
  }
  return session;
}
