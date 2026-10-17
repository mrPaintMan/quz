import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

// Writes each round's index as its position, touching only rounds that moved.
export async function saveRoundOrder(ctx: MutationCtx, rounds: Doc<"rounds">[]): Promise<void> {
  await Promise.all(
    rounds.map((round, position) =>
      round.position === position ? null : ctx.db.patch("rounds", round._id, { position }),
    ),
  );
}
