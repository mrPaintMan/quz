import { v } from "convex/values";
import { hostQuery } from "../auth/hostFunctions";

export const getMediaUrl = hostQuery({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => ctx.storage.getUrl(storageId),
});
