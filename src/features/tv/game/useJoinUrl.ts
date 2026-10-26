"use client";

import { useSyncExternalStore } from "react";

const noSubscription = () => () => {};

// Where phones join: the start page of the address the TV runs on, so dev works like quz.nu.
// null while rendering on the server, which doesn't know the address.
export function useJoinUrl(): URL | null {
  const origin = useSyncExternalStore(noSubscription, () => window.location.origin, () => null);
  return origin === null ? null : new URL("/", origin);
}
