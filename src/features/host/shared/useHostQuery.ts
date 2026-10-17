"use client";

import { useQuery, type OptionalRestArgsOrSkip } from "convex/react";
import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server";
import { useHostSession } from "@/features/host/shared/HostSession";

type HostQuery = FunctionReference<"query", "public", { hostPassphrase: string }>;
type ArgsWithoutPassphrase<Q extends HostQuery> = Omit<FunctionArgs<Q>, "hostPassphrase">;

// useQuery for host-only functions: adds the passphrase so callers never handle it.
export function useHostQuery<Q extends HostQuery>(
  query: Q,
  args: ArgsWithoutPassphrase<Q> | "skip",
): FunctionReturnType<Q> | undefined {
  const { passphrase } = useHostSession();
  const fullArgs = args === "skip" ? "skip" : { ...args, hostPassphrase: passphrase };
  // Convex's rest-argument typing can't follow the generic; the shape is the query's own arguments.
  return useQuery(query, ...([fullArgs] as OptionalRestArgsOrSkip<Q>));
}
