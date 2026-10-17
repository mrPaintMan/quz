import { ConvexError } from "convex/values";
import type { Doc, Id, TableNames } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

export async function getOrThrow<T extends TableNames>(ctx: QueryCtx, table: T, id: Id<T>): Promise<Doc<T>> {
  const document = await ctx.db.get(table, id);
  if (document === null) {
    throw new ConvexError("Hittades inte, den kan ha tagits bort.");
  }
  return document;
}
