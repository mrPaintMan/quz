import { afterEach, describe, expect, it, vi } from "vitest";
import { requireHost } from "./requireHost";

describe("requireHost", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("lets the right passphrase through", () => {
    vi.stubEnv("HOST_PASSPHRASE", "pepparkaka");
    expect(() => requireHost("pepparkaka")).not.toThrow();
  });

  it("refuses a wrong passphrase", () => {
    vi.stubEnv("HOST_PASSPHRASE", "pepparkaka");
    expect(() => requireHost("lussekatt")).toThrow("Fel lösenord.");
  });
});
