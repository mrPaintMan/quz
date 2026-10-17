import { defineTable } from "convex/server";
import { v } from "convex/values";

export const quizzesTable = defineTable({
  title: v.string(),
  year: v.number(),
  updatedAt: v.number(),
}).index("by_updatedAt", ["updatedAt"]);
