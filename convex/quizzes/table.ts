import { defineTable } from "convex/server";
import { v } from "convex/values";

export const quizzesTable = defineTable({
  title: v.string(),
  year: v.number(),
  updatedAt: v.number(),
  // A Julquiz: the TV and the phones get the Christmas look (D75). Left out for no.
  isChristmas: v.optional(v.boolean()),
}).index("by_updatedAt", ["updatedAt"]);
