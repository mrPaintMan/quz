import { ConvexError } from "convex/values";
import { describe, expect, it } from "vitest";
import { describeActionError } from "./describeActionError";

describe("describeActionError", () => {
  it("shows the message our Convex functions give", () => {
    expect(describeActionError(new ConvexError("Ett quiz kan ha högst 50 omgångar."))).toBe("Ett quiz kan ha högst 50 omgångar.");
  });

  it.each([new Error("fetch failed"), new ConvexError({ code: 1 }), "oops"])("falls back to a general message for %o", (error) => {
    expect(describeActionError(error)).toBe("Något gick fel. Kontrollera anslutningen och försök igen.");
  });
});
