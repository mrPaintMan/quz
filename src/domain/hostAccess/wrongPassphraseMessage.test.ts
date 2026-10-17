import { describe, expect, it } from "vitest";
import { WRONG_PASSPHRASE_MESSAGE } from "./wrongPassphraseMessage";

describe("WRONG_PASSPHRASE_MESSAGE", () => {
  it("is the Swedish message the hosts see", () => {
    expect(WRONG_PASSPHRASE_MESSAGE).toBe("Fel lösenord.");
  });
});
