import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

// Links to pictures by their file, for a question's image options; a file that is gone is left out.
export async function linkImages(ctx: QueryCtx, imageIds: Id<"_storage">[]): Promise<Record<string, string>> {
  const links = await Promise.all(imageIds.map(async (id) => [id, await ctx.storage.getUrl(id)] as const));
  return Object.fromEntries(links.filter((link): link is readonly [Id<"_storage">, string] => link[1] !== null));
}
