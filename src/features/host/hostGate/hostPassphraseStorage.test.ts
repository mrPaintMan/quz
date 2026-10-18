import { afterEach, describe, expect, it, vi } from "vitest";
import { clearStoredPassphrase, readStoredPassphrase, storePassphrase } from "./hostPassphraseStorage";

describe("hostPassphraseStorage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("remembers, reads and forgets the passphrase", () => {
    storePassphrase("pepparkaka");
    expect(readStoredPassphrase()).toBe("pepparkaka");
    clearStoredPassphrase();
    expect(readStoredPassphrase()).toBeNull();
  });

  it("acts as if nothing is stored when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => storePassphrase("pepparkaka")).not.toThrow();
    expect(() => clearStoredPassphrase()).not.toThrow();
    expect(readStoredPassphrase()).toBeNull();
  });
});
