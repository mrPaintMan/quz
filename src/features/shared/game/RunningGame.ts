import type { FunctionReturnType } from "convex/server";
import type { api } from "@convex/_generated/api";

// The running game as the TV, the phones and the hosts' live control get it (getRunningGame).
export type RunningGame = NonNullable<FunctionReturnType<typeof api.games.queries.getRunningGame>>;
