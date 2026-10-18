import { customMutation, customQuery } from "convex-helpers/server/customFunctions";
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireHost } from "./requireHost";

// Every host function takes the passphrase and checks it before its handler runs (D21).
const hostOnly = {
  args: { hostPassphrase: v.string() },
  input: async (_ctx: unknown, { hostPassphrase }: { hostPassphrase: string }) => {
    requireHost(hostPassphrase);
    return { ctx: {}, args: {} };
  },
};

export const hostQuery = customQuery(query, hostOnly);
export const hostMutation = customMutation(mutation, hostOnly);
