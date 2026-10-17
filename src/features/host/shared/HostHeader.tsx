"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useHostSession } from "@/features/host/shared/HostSessionProvider";

export function HostHeader({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  const { logOut } = useHostSession();
  return (
    <header className="flex flex-wrap items-center gap-3 border-b bg-card px-4 py-3 sm:px-6">
      <Link href="/admin" className="text-xl font-bold tracking-tight text-primary">
        Quz
      </Link>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">{children}</div>
      <div className="flex flex-wrap items-center gap-2">
        {actions}
        <Button variant="ghost" onClick={logOut}>
          Logga ut
        </Button>
      </div>
    </header>
  );
}
