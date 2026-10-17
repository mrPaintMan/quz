"use client";

import { useMutation } from "convex/react";
import type { FunctionArgs, FunctionReference, FunctionReturnType, OptionalRestArgs } from "convex/server";
import { useCallback } from "react";
import { useHostSession } from "@/features/host/shared/HostSession";

type HostMutation = FunctionReference<"mutation", "public", { hostPassphrase: string }>;

// useMutation for host-only functions: adds the passphrase so callers never handle it.
export function useHostMutation<M extends HostMutation>(
  mutation: M,
): (args: Omit<FunctionArgs<M>, "hostPassphrase">) => Promise<FunctionReturnType<M>> {
  const { passphrase } = useHostSession();
  const run = useMutation(mutation);
  return useCallback(
    // Convex's rest-argument typing can't follow the generic; the shape is the mutation's own arguments.
    (args) => run(...([{ ...args, hostPassphrase: passphrase }] as OptionalRestArgs<M>)),
    [run, passphrase],
  );
}
