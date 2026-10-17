"use client";

import { ConvexError } from "convex/values";
import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type SessionErrorBoundaryProps = { children: ReactNode; onWrongPassphrase: () => void };

function isWrongPassphrase(error: unknown): boolean {
  return error instanceof ConvexError && error.data === "Fel lösenord.";
}

// A host query that throws while rendering would otherwise blank the page. A changed
// passphrase sends the host back to the login screen; anything else offers a reload.
export class SessionErrorBoundary extends Component<SessionErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (isWrongPassphrase(error)) {
      this.props.onWrongPassphrase();
    }
  }

  render() {
    if (!this.state.failed) {
      return this.props.children;
    }
    return (
      <div role="alert" className="flex flex-col items-center gap-3 p-8 text-center">
        <p>Något gick fel när sidan skulle visas.</p>
        <Button onClick={() => window.location.reload()}>Ladda om</Button>
      </div>
    );
  }
}
