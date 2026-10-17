import { afterEach, describe, expect, it, vi } from "vitest";
import { isHostPassphrase } from "./isHostPassphrase";

describe("isHostPassphrase", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("accepts the passphrase set on the deployment", () => {
    vi.stubEnv("HOST_PASSPHRASE", "pepparkaka");
    expect(isHostPassphrase("pepparkaka")).toBe(true);
  });

  it("rejects any other passphrase", () => {
    vi.stubEnv("HOST_PASSPHRASE", "pepparkaka");
    expect(isHostPassphrase("lussekatt")).toBe(false);
  });

  it("rejects everything when no passphrase is set, even an empty one", () => {
    vi.stubEnv("HOST_PASSPHRASE", "");
    expect(isHostPassphrase("")).toBe(false);
  });
});
