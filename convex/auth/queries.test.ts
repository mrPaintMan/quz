import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { setupConvexTest, TEST_PASSPHRASE } from "../test.setup";

describe("checkPassphrase", () => {
  it("tells the login screen whether the passphrase is right", async () => {
    const t = setupConvexTest();
    await expect(t.query(api.auth.queries.checkPassphrase, { passphrase: TEST_PASSPHRASE })).resolves.toBe(true);
    await expect(t.query(api.auth.queries.checkPassphrase, { passphrase: "fel" })).resolves.toBe(false);
  });
});
