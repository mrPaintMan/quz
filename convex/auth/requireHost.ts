import { ConvexError } from "convex/values";
import { isHostPassphrase } from "./isHostPassphrase";

export function requireHost(passphrase: string): void {
  if (!isHostPassphrase(passphrase)) {
    throw new ConvexError("Fel lösenord.");
  }
}
