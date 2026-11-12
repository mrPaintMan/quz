import { describe, expect, it } from "vitest";
import type { ContentOf } from "@convex/questions/questionContent";
import { pointsOf } from "@/domain/answering/outcome";
import { mapPinAnswering } from "./mapPinAnswering";

const stockholm = { lat: 59.3293, lng: 18.0686 };
const uppsala = { lat: 59.8586, lng: 17.6389 };
const gothenburg = { lat: 57.7089, lng: 11.9746 };
const content: ContentOf<"mapPin"> = { type: "mapPin", target: stockholm, radiusMeters: 100_000, points: 3, initialView: { center: { lat: 62, lng: 15 }, zoom: 4 } };
const pinned = (pin: { lat: number; lng: number } | null) => ({ type: "mapPin" as const, pin });

describe("mapPinAnswering", () => {
  it("shows where the map starts, and starts the pin there", () => {
    const shown = mapPinAnswering.show(content);
    expect(shown).toEqual({ type: "mapPin", initialView: content.initialView });
    expect(mapPinAnswering.startingAnswer(shown)).toEqual(pinned({ lat: 62, lng: 15 }));
  });

  it("can be sent with a pin on the Earth", () => {
    const shown = mapPinAnswering.show(content);
    expect(mapPinAnswering.isComplete(shown, pinned(uppsala))).toBe(true);
    expect(mapPinAnswering.isComplete(shown, pinned(null))).toBe(false);
    expect(mapPinAnswering.isComplete(shown, pinned({ lat: 95, lng: 0 }))).toBe(false);
  });

  it("scores a pin within the radius, and says how far off each pin was", () => {
    const outcomes = mapPinAnswering.outcomes(content, [pinned(uppsala), pinned(gothenburg), pinned(null)]);
    expect(pointsOf(outcomes)).toEqual([3, 0, 0]);
    expect(outcomes[0].parts[0]).toEqual({ label: "", given: "64 km från rätt plats", result: "right", correct: "", points: 3 });
    expect(outcomes[1].parts[0].given).toBe("397 km från rätt plats");
  });

  it("reveals the target and every team's pin, most points first and then the closest", () => {
    const teams = [
      { _id: "t1", name: "Röda", colour: "red" as const },
      { _id: "t2", name: "Blå", colour: "blue" as const },
      { _id: "t3", name: "Gröna", colour: "green" as const },
    ];
    const revealed = mapPinAnswering.reveal(content, { answers: [pinned(gothenburg), pinned(uppsala), pinned(null)], verdicts: [], teams });
    expect(revealed).toMatchObject({ target: stockholm, radiusMeters: 100_000, initialView: content.initialView });
    expect(revealed.pins.map(({ name, points }) => [name, points])).toEqual([
      ["Blå", 3],
      ["Röda", 0],
    ]);
    expect(revealed.pins[0]).toMatchObject({ teamId: "t2", colour: "blue", pin: uppsala });
  });

  it("gives the phones the teams' pins without the right place or its radius", () => {
    const teams = [{ _id: "t1", name: "Röda", colour: "red" as const }];
    const forTeams = mapPinAnswering.revealToTeams?.(content, { answers: [pinned(uppsala)], verdicts: [], teams });
    expect(forTeams).toMatchObject({ target: null, radiusMeters: null, pins: [{ name: "Röda", points: 3 }] });
  });

  it("reveals no pins without the teams' answers or a target", () => {
    expect(mapPinAnswering.reveal(content).pins).toEqual([]);
    expect(mapPinAnswering.reveal({ ...content, target: null }, { answers: [pinned(uppsala)], verdicts: [], teams: [{ _id: "t1", name: "Röda", colour: "red" }] }).pins).toEqual([]);
  });
});
