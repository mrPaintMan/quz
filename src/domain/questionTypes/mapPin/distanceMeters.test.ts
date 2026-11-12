import { describe, expect, it } from "vitest";
import { distanceMeters, formatDistance } from "./distanceMeters";

const stockholm = { lat: 59.3293, lng: 18.0686 };
const gothenburg = { lat: 57.7089, lng: 11.9746 };

describe("distanceMeters", () => {
  it("measures over the Earth's surface", () => {
    expect(distanceMeters(stockholm, gothenburg) / 1000).toBeCloseTo(397, 0);
    expect(distanceMeters(stockholm, stockholm)).toBe(0);
  });

  it("measures across the 180° meridian the short way", () => {
    expect(distanceMeters({ lat: 0, lng: 179.9 }, { lat: 0, lng: -179.9 })).toBeLessThan(30_000);
  });
});

describe("formatDistance", () => {
  it("reads in metres up close and in kilometres further off", () => {
    expect(formatDistance(812)).toBe("810 m");
    expect(formatDistance(1234)).toBe("1,2 km");
    expect(formatDistance(396_892)).toBe("397 km");
    expect(formatDistance(1_234_567)).toMatch(/^1\s235 km$/);
  });
});
