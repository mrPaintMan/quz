"use client";

import { useConvex, useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { api } from "@convex/_generated/api";
import { ActionErrorProvider } from "@/features/host/shared/ActionErrorProvider";
import { HostSessionProvider } from "@/features/host/shared/HostSessionProvider";
import { LoginForm } from "./LoginForm";
import { SessionErrorBoundary } from "./SessionErrorBoundary";
import { useStoredPassphrase } from "./useStoredPassphrase";

function Checking() {
  return <p className="p-8 text-center text-muted-foreground">Kontrollerar inloggning…</p>;
}

// Shows the login screen until a passphrase the server accepts is stored (D21).
export function HostGate({ children }: { children: ReactNode }) {
  const convex = useConvex();
  const { passphrase, remember, forget } = useStoredPassphrase();
  const storedIsValid = useQuery(api.auth.queries.checkPassphrase, passphrase ? { passphrase } : "skip");
  const storedWasRejected = passphrase !== null && passphrase !== undefined && storedIsValid === false;

  useEffect(() => {
    if (storedWasRejected) {
      forget();
    }
  }, [storedWasRejected, forget]);

  const logIn = useCallback(
    async (candidate: string) => {
      const accepted = await convex.query(api.auth.queries.checkPassphrase, { passphrase: candidate });
      if (accepted) {
        remember(candidate);
      }
      return accepted;
    },
    [convex, remember],
  );

  const session = useMemo(() => (passphrase ? { passphrase, logOut: forget } : null), [passphrase, forget]);

  if (passphrase === undefined) {
    return <Checking />;
  }
  if (session === null || storedWasRejected) {
    return <LoginForm onSubmit={logIn} />;
  }
  if (storedIsValid === undefined) {
    return <Checking />;
  }
  return (
    <HostSessionProvider session={session}>
      <ActionErrorProvider>
        <SessionErrorBoundary onWrongPassphrase={forget}>{children}</SessionErrorBoundary>
      </ActionErrorProvider>
    </HostSessionProvider>
  );
}
