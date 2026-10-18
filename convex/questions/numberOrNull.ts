import { v } from "convex/values";

// A number the hosts type in; null while the field is empty (D28).
export const numberOrNull = v.union(v.number(), v.null());
