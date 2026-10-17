import { v } from "convex/values";
import { query } from "../_generated/server";
import { isHostPassphrase } from "./isHostPassphrase";

export const checkPassphrase = query({
  args: { passphrase: v.string() },
  handler: async (_ctx, { passphrase }) => isHostPassphrase(passphrase),
});
