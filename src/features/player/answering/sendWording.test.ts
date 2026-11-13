import { describe, expect, it } from "vitest";
import { sendWordingOf } from "./sendWording";

describe("sendWordingOf", () => {
  it("sends most answers with Skicka svar", () => {
    expect(sendWordingOf("freeText")).toMatchObject({ button: "Skicka svar", sent: "Svar skickat ✓", isBrake: false });
  });

  it("sends a trip's guess with the emergency brake", () => {
    expect(sendWordingOf("paSparet")).toMatchObject({ button: "Dra i nödbromsen", sent: "Gissningen är låst.", isBrake: true });
  });
});
