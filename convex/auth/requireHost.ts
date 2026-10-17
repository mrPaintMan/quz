import { ConvexError } from "convex/values";
import { WRONG_PASSPHRASE_MESSAGE } from "@/domain/hostAccess/wrongPassphraseMessage";
import { isHostPassphrase } from "./isHostPassphrase";

export function requireHost(passphrase: string): void {
  if (!isHostPassphrase(passphrase)) {
    throw new ConvexError(WRONG_PASSPHRASE_MESSAGE);
  }
}
